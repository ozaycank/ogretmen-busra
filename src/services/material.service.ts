import { prisma } from "@/lib/db/prisma";
import { GradeLevel, ContentCategory } from "@prisma/client";

interface GetMaterialsQueryDTO {
    page: number;
    limit: number;
    grade?: GradeLevel;
    category?: ContentCategory;
    search?: string;
}

export class MaterialService {

    /**
     * Platformdaki onaylanmış materyalleri sayfalama ve filtreleme ile getirir.
     */
    static async getMaterials({ page, limit, grade, category, search }: GetMaterialsQueryDTO) {
        const skip = (page - 1) * limit;

        const where = {
            status: "APPROVED" as const,
            ...(grade && { grade }),
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

    // NOTE: createMaterial via Buffer is intentionally removed.
    // Uploads must utilize the Presigned URL flow defined in UploadService 
    // to bypass 4.5MB Vercel Serverless payload limits.
}