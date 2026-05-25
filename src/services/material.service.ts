// src/services/material.service.ts
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { GradeLevel, ContentCategory } from "@prisma/client";
import crypto from "crypto";

interface CreateMaterialDTO {
    title: string;
    description?: string | null;
    authorName: string;
    grade: GradeLevel;
    category: ContentCategory;
    turnstileToken: string;
    file: File;
    ip: string;
}

interface GetMaterialsQueryDTO {
    page: number;
    limit: number;
    grade?: GradeLevel;
    category?: ContentCategory;
    search?: string;
}

export class MaterialService {
    private static async verifyTurnstile(token: string): Promise<void> {
        const verifyEndpoint = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
        const res = await fetch(verifyEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${token}`,
        });
        const data = await res.json();
        if (!data.success) {
            throw Object.assign(new Error("Bot validation failed"), { statusCode: 403 });
        }
    }

    static async getMaterials({ page, limit, grade, category, search }: GetMaterialsQueryDTO) {
        const skip = (page - 1) * limit;

        const where = {
            status: "APPROVED" as const,
            ...(grade && { grade }),
            ...(category && { category }),
            ...(search && { title: { contains: search, mode: "insensitive" as const } }),
        };

        const [items, total] = await Promise.all([
            prisma.material.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    fileType: true,
                    fileSize: true,
                    authorName: true,
                    grade: true,
                    category: true,
                    downloadCount: true,
                    viewCount: true,
                    createdAt: true,
                }
            }),
            prisma.material.count({ where })
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    static async createMaterial(data: CreateMaterialDTO) {
        await this.verifyTurnstile(data.turnstileToken);

        const fileBuffer = Buffer.from(await data.file.arrayBuffer());
        const uniqueFileName = `${Date.now()}-${data.file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

        // R2 Upload
        const fileUrl = await uploadToR2(fileBuffer, uniqueFileName, data.file.type);

        // IP Hashing for rate-limit prep
        const ipHash = crypto.createHash("sha256").update(data.ip).digest("hex");

        return prisma.material.create({
            data: {
                title: data.title,
                description: data.description,
                authorName: data.authorName,
                grade: data.grade,
                category: data.category,
                turnstileToken: data.turnstileToken,
                fileUrl,
                fileType: data.file.name.split(".").pop() || "unknown",
                fileSize: data.file.size,
                ipHash,
            },
            select: { id: true }
        });
    }
}