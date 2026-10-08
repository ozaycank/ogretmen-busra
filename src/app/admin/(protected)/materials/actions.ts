"use server";

import {
    revalidatePath,
    revalidateTag,
} from "next/cache";
import { headers } from "next/headers";

import {
    AuditAction,
    FileStatus,
    Role,
} from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/infrastructure/database/prisma";
import { logger } from "@/infrastructure/logger";

const MATERIALS_CACHE_TAG = "materials";

function revalidatePublicMaterialContent(
    slug?: string,
) {
    /*
     * unstable_cache ile cache'lenen bütün materyal
     * sorgularını anında geçersiz yap.
     *
     * Next.js 16'da tek parametreli revalidateTag
     * deprecated olduğu için explicit expire kullanıyoruz.
     */
    revalidateTag(MATERIALS_CACHE_TAG, {
        expire: 0,
    });

    /*
     * Public route çıktıları.
     */
    revalidatePath("/");
    revalidatePath("/materyaller");
    revalidatePath("/genel-materyaller");

    /*
     * Sınıf ve ders landing sayfaları.
     */
    revalidatePath("/[gradeSlug]", "page");
    revalidatePath(
        "/[gradeSlug]/[subjectSlug]",
        "page",
    );

    /*
     * Tek materyal işleminde yalnız ilgili detay sayfasını
     * invalidate etmek daha verimli.
     */
    if (slug) {
        revalidatePath(`/materyal/${slug}`);
    } else {
        /*
         * Bulk işlemde hangi slugların etkilendiğini tek tek
         * dolaşmak yerine route pattern invalidate edilir.
         */
        revalidatePath(
            "/materyal/[slug]",
            "page",
        );
    }
}

function getAuditAction(
    newStatus: FileStatus,
): AuditAction {
    if (newStatus === FileStatus.APPROVED) {
        return AuditAction.MATERIAL_APPROVED;
    }

    if (newStatus === FileStatus.REJECTED) {
        return AuditAction.MATERIAL_REJECTED;
    }

    /*
     * Mevcut uygulama davranışını bozmayalım.
     * Diğer statüler mevcut audit enum'ında ayrı bir
     * STATUS_CHANGED tipi bulunmadığından eski fallback korunuyor.
     */
    return AuditAction.MATERIAL_DELETED;
}

export async function updateMaterialStatus(
    materialId: string,
    newStatus: FileStatus,
) {
    try {
        const session = await auth();

        if (
            !session?.user ||
            (
                session.user.role !== Role.ADMIN &&
                session.user.role !== Role.MODERATOR
            )
        ) {
            throw new Error("Yetkisiz işlem.");
        }

        const headerList = await headers();

        const ip =
            headerList.get("cf-connecting-ip") ||
            headerList
                .get("x-forwarded-for")
                ?.split(",")[0]
                ?.trim() ||
            "127.0.0.1";

        const updated =
            await prisma.material.update({
                where: {
                    id: materialId,
                },

                data: {
                    status: newStatus,
                },
            });

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,

                action:
                    getAuditAction(newStatus),

                ipAddress: ip,

                details:
                    `Materyal ${newStatus} durumuna çekildi: ` +
                    `${updated.title} (${updated.id})`,
            },
        });

        /*
         * Admin ekranları.
         */
        revalidatePath("/admin/materials");
        revalidatePath("/admin/dashboard");

        /*
         * Public cache.
         */
        revalidatePublicMaterialContent(
            updated.slug,
        );

        return {
            success: true,
        };
    } catch (error) {
        logger.error(
            {
                err: error,
                materialId,
            },
            "Materyal durumu güncellenirken hata",
        );

        return {
            success: false,
            error: "İşlem başarısız oldu.",
        };
    }
}

export async function bulkUpdateStatus(
    materialIds: string[],
    newStatus: FileStatus,
) {
    try {
        const session = await auth();

        if (
            !session?.user ||
            session.user.role !== Role.ADMIN
        ) {
            throw new Error(
                "Toplu işlem için Admin yetkisi gereklidir.",
            );
        }

        if (materialIds.length === 0) {
            return {
                success: true,
            };
        }

        await prisma.material.updateMany({
            where: {
                id: {
                    in: materialIds,
                },
            },

            data: {
                status: newStatus,
            },
        });

        revalidatePath("/admin/materials");
        revalidatePath("/admin/dashboard");

        revalidatePublicMaterialContent();

        return {
            success: true,
        };
    } catch (error) {
        logger.error(
            {
                err: error,
                materialIds,
            },
            "Toplu materyal durumu güncellenirken hata",
        );

        return {
            success: false,
            error:
                "Toplu işlem başarısız.",
        };
    }
}