import { prisma } from "@/infrastructure/database/prisma";
import { GradeLevel, ContentCategory, SubjectType } from "@prisma/client";

interface GetMaterialsQueryDTO {
    page: number;
    limit: number;
    grade?: GradeLevel;
    subject?: SubjectType;
    category?: ContentCategory;
    search?: string;
}

export class MaterialService {
    static async getMaterials({ page, limit, grade, subject, category, search }: GetMaterialsQueryDTO) {
        const skip = (page - 1) * limit;

        const where = {
            status: "APPROVED" as const,
            ...(grade && { grade }),
            // 🚀 DÜZELTME: TUM_DERSLER filtresi DB'de özel olarak yakalanmaz, tümünü getirir.
            ...(subject && subject !== "TUM_DERSLER" && { subject }),
            ...(category && { category }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: "insensitive" as const } },
                    { description: { contains: search, mode: "insensitive" as const } }
                ]
            }),
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
                    subject: true,
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
}