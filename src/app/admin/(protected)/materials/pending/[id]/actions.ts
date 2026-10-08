"use server";

import {
    revalidatePath,
    revalidateTag,
} from "next/cache";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import {
    AuditAction,
    FileStatus,
} from "@prisma/client";

import { auth } from "@/auth";

import { prisma } from "@/infrastructure/database/prisma";
import { logger } from "@/infrastructure/logger";

const MATERIALS_CACHE_TAG = "materials";

export async function moderateMaterial(
    materialId: string,
    action:
        | "APPROVE"
        | "REJECT",
    reason?: string,
) {
    try {
        /*
         * -----------------------------------------------------
         * AUTHORIZATION
         * -----------------------------------------------------
         */

        const session =
            await auth();

        if (
            !session?.user ||
            (
                session.user.role !==
                "ADMIN" &&
                session.user.role !==
                "MODERATOR"
            )
        ) {
            throw new Error(
                "Yetkisiz işlem.",
            );
        }

        /*
         * -----------------------------------------------------
         * REQUEST IP
         * -----------------------------------------------------
         */

        const headerList =
            await headers();

        const ip =
            headerList.get(
                "cf-connecting-ip",
            ) ||
            headerList
                .get(
                    "x-forwarded-for",
                )
                ?.split(",")[0]
                ?.trim() ||
            "127.0.0.1";

        /*
         * -----------------------------------------------------
         * STATUS / AUDIT ACTION
         * -----------------------------------------------------
         */

        const newStatus =
            action === "APPROVE"
                ? FileStatus.APPROVED
                : FileStatus.REJECTED;

        const auditAction =
            action === "APPROVE"
                ? AuditAction.MATERIAL_APPROVED
                : AuditAction.MATERIAL_REJECTED;

        /*
         * -----------------------------------------------------
         * DATABASE UPDATE
         * -----------------------------------------------------
         */

        const updated =
            await prisma.material.update({
                where: {
                    id: materialId,
                },

                data: {
                    status:
                        newStatus,

                    scanResult:
                        reason
                            ? `Moderasyon Notu: ${reason}`
                            : null,
                },
            });

        /*
         * -----------------------------------------------------
         * AUDIT LOG
         * -----------------------------------------------------
         */

        await prisma.auditLog.create({
            data: {
                userId:
                    session.user.id,

                action:
                    auditAction,

                ipAddress:
                    ip,

                details:
                    `Materyal ID: ${materialId} | ` +
                    `İşlem: ${action} | ` +
                    `Sebep: ${reason || "Belirtilmedi"} | ` +
                    `R2 Key: ${updated.fileKey}`,
            },
        });

        logger.info(
            {
                adminId:
                    session.user.id,

                materialId,

                action,
            },

            "Moderasyon işlemi tamamlandı",
        );

        /*
         * -----------------------------------------------------
         * CACHE INVALIDATION
         * -----------------------------------------------------
         *
         * unstable_cache içindeki "materials" tag'li
         * public materyal sorgularını hemen expire ediyoruz.
         *
         * Böylece onaylanan materyal public tarafta eski
         * cache süresinin dolmasını beklemez.
         */

        revalidateTag(
            MATERIALS_CACHE_TAG,
            {
                expire: 0,
            },
        );

        /*
         * Admin ekranları
         */

        revalidatePath(
            "/admin/materials",
        );

        revalidatePath(
            "/admin/dashboard",
        );

        /*
         * Public ana sayfa
         */

        revalidatePath("/");

        /*
         * Ana materyal listeleme
         */

        revalidatePath(
            "/materyaller",
        );

        /*
         * Genel materyaller
         */

        revalidatePath(
            "/genel-materyaller",
        );

        /*
         * Değişen materyalin kendi detail sayfası.
         *
         * APPROVED:
         * yeni public sayfa oluşturulabilir.
         *
         * REJECTED:
         * eski cached detail çıktısının temizlenmesini sağlar.
         */

        if (updated.slug) {
            revalidatePath(
                `/materyal/${updated.slug}`,
            );
        }

        /*
         * Sınıf landing sayfaları
         */

        revalidatePath(
            "/[gradeSlug]",
            "page",
        );

        /*
         * Sınıf + ders landing sayfaları
         */

        revalidatePath(
            "/[gradeSlug]/[subjectSlug]",
            "page",
        );
    } catch (error) {
        logger.error(
            {
                err: error,
                materialId,
            },

            "Moderasyon başarısız",
        );

        throw new Error(
            "İşlem gerçekleştirilemedi.",
        );
    }

    /*
     * redirect try/catch dışında kalmalı.
     *
     * Next.js redirect() özel bir control-flow exception
     * kullandığı için catch içine alınması doğru değildir.
     */
    redirect(
        "/admin/materials",
    );
}