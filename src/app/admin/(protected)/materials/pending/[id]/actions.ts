"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/infrastructure/database/prisma";
import { FileStatus, AuditAction } from "@prisma/client";
import { headers } from "next/headers";
import { logger } from "@/infrastructure/logger";
import { auth } from "@/auth";

export async function moderateMaterial(materialId: string, action: "APPROVE" | "REJECT", reason?: string) {
    try {
        const session = await auth();
        // Sadece Admin ve Moderator yapabilir
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
            throw new Error("Yetkisiz işlem.");
        }

        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "unknown";

        const newStatus = action === "APPROVE" ? FileStatus.APPROVED : FileStatus.REJECTED;
        const auditAction = action === "APPROVE" ? AuditAction.MATERIAL_APPROVED : AuditAction.MATERIAL_REJECTED;

        const updated = await prisma.material.update({
            where: { id: materialId },
            data: {
                status: newStatus,
                scanResult: reason ? `Moderasyon Notu: ${reason}` : null
            }
        });

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: auditAction,
                ipAddress: ip,
                details: `Materyal ID: ${materialId} | İşlem: ${action} | Sebep: ${reason || "Belirtilmedi"} | R2 Key: ${updated.fileKey}`
            }
        });

        logger.info({ adminId: session.user.id, materialId, action }, "Moderasyon işlemi tamamlandı");

    } catch (error) {
        logger.error({ err: error, materialId }, "Moderasyon başarısız");
        throw new Error("İşlem gerçekleştirilemedi.");
    }

    revalidatePath("/admin/materials");
    redirect("/admin/materials");
}