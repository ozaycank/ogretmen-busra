import { PrismaClient, FileStatus } from "@prisma/client";
import { IMaterialRepository } from "../../domain/repositories/material.repository.interface";
import { Material, MaterialStatus } from "../../domain/entities/material.entity";
import crypto from "crypto";

export class PrismaMaterialRepository implements IMaterialRepository {
    constructor(private readonly prisma: PrismaClient) { }

    // Prisma modelini pure Domain Entity'sine çevirir
    private toEntity(record: any): Material {
        return new Material(
            record.id,
            record.title,
            record.fileUrl || "",
            record.fileKey,
            record.originalName,
            record.mimeType,
            record.authorName,
            // Prisma'daki FileStatus'ü, Domain'deki MaterialStatus'e cast ediyoruz
            record.status as unknown as MaterialStatus,
            record.createdAt,
            record.updatedAt
        );
    }

    async findById(id: string): Promise<Material | null> {
        const record = await this.prisma.material.findUnique({ where: { id } });
        return record ? this.toEntity(record) : null;
    }

    async findAll(limit: number, offset: number): Promise<Material[]> {
        const records = await this.prisma.material.findMany({
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' }
        });
        return records.map(record => this.toEntity(record));
    }

    async create(data: Omit<Material, "id" | "createdAt" | "updatedAt">): Promise<Material> {
        const record = await this.prisma.material.create({
            data: {
                title: data.title,
                fileUrl: data.fileUrl,
                fileKey: data.fileKey,
                originalName: data.originalName,
                mimeType: data.mimeType,
                authorName: data.authorName,
                // Domain status'ünü Prisma FileStatus'üne cast ediyoruz
                status: data.status as unknown as FileStatus,

                // --- MVP aşaması için formdan gelmeyen alanların varsayılanları ---
                fileSize: 0,
                fileType: data.mimeType.split('/')[1] || "unknown", // Örn: image/jpeg -> jpeg
                grade: "GENEL",
                category: "ETKINLIK",
                turnstileToken: crypto.randomUUID(),
                ipHash: "system"
            }
        });
        return this.toEntity(record);
    }

    async updateStatus(id: string, status: MaterialStatus): Promise<void> {
        await this.prisma.material.update({
            where: { id },
            data: { status: status as unknown as FileStatus }
        });
    }
}