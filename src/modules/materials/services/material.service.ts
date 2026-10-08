import { unstable_cache } from "next/cache";

import { prisma } from "@/infrastructure/database/prisma";

import {
    ContentCategory,
    FileStatus,
    GradeLevel,
    Prisma,
    SubjectType,
} from "@prisma/client";

interface GetMaterialsQueryDTO {
    page: number;
    limit: number;
    grade?: GradeLevel;
    subject?: SubjectType;
    category?: ContentCategory;
    search?: string;
}

const MATERIALS_CACHE_TAG = "materials";

async function queryMaterials(
    page: number,
    limit: number,
    grade: GradeLevel | null,
    subject: SubjectType | null,
    category: ContentCategory | null,
    search: string | null,
) {
    const skip = (page - 1) * limit;

    const where: Prisma.MaterialWhereInput = {
        status: FileStatus.APPROVED,

        ...(grade
            ? {
                grade,
            }
            : {}),

        ...(subject && subject !== SubjectType.TUM_DERSLER
            ? {
                subject,
            }
            : {}),

        ...(category
            ? {
                category,
            }
            : {}),

        ...(search
            ? {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        description: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            }
            : {}),
    };

    const [items, total] = await Promise.all([
        prisma.material.findMany({
            where,

            skip,

            take: limit,

            orderBy: {
                createdAt: "desc",
            },

            select: {
                id: true,
                slug: true,
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
            },
        }),

        prisma.material.count({
            where,
        }),
    ]);

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

/*
 * Kullanıcının serbest metin araması dışındaki standart
 * materyal listelemelerini cache'e alıyoruz.
 *
 * Fonksiyon argümanları cache anahtarının parçasıdır.
 * Örneğin:
 *
 * SINIF_1 + MATEMATIK + ETKINLIK + page 1
 *
 * ile
 *
 * SINIF_3 + TURKCE + ODEV + page 2
 *
 * birbirinden farklı cache kayıtlarıdır.
 */
const getCachedMaterials = unstable_cache(
    async (
        page: number,
        limit: number,
        grade: GradeLevel | null,
        subject: SubjectType | null,
        category: ContentCategory | null,
    ) => {
        return queryMaterials(
            page,
            limit,
            grade,
            subject,
            category,
            null,
        );
    },
    ["public-material-list-v1"],
    {
        tags: [MATERIALS_CACHE_TAG],
        revalidate: 300,
    },
);

export class MaterialService {
    static async getMaterials({
        page,
        limit,
        grade,
        subject,
        category,
        search,
    }: GetMaterialsQueryDTO) {
        const normalizedSearch = search?.trim() || null;

        /*
         * Arama kelimeleri kullanıcı tarafından sınırsız biçimde
         * üretilebildiği için search sonuçlarını kalıcı Data Cache'e
         * koymuyoruz.
         */
        if (normalizedSearch) {
            return queryMaterials(
                page,
                limit,
                grade ?? null,
                subject ?? null,
                category ?? null,
                normalizedSearch,
            );
        }

        /*
         * Normal sınıf / ders / kategori / sayfalama trafiği cache'den.
         */
        return getCachedMaterials(
            page,
            limit,
            grade ?? null,
            subject ?? null,
            category ?? null,
        );
    }
}