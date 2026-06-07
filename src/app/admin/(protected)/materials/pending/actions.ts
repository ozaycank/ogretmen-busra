"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/database/prisma";
import { FileStatus, AuditAction } from "@prisma/client";
import { headers } from "next/headers";
import { logger } from "@/infrastructure/logger";
import { auth } from "@/auth";

export async function bulkModerateMaterials(materialIds: string[], action: "APPROVE" | "REJECT", reason?: string) {
    try {
        const session = await auth();
        // Sadece Admin ve Moderator yapabilir
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
            throw new Error("Yetkisiz işlem");
        }

        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "unknown";

        const newStatus = action === "APPROVE" ? FileStatus.APPROVED : FileStatus.REJECTED;
        const auditAction = action === "APPROVE" ? AuditAction.MATERIAL_APPROVED : AuditAction.MATERIAL_REJECTED;

        // Transaction-Safe Bulk Execution
        await prisma.$transaction(async (tx) => {
            // 1. Materyalleri güncelle
            await tx.material.updateMany({
                where: { id: { in: materialIds }, status: FileStatus.UPLOAD_PENDING },
                data: {
                    status: newStatus,
                    scanResult: reason ? `Toplu İşlem Notu: ${reason}` : null
                }
            });

            // 2. Her bir materyal için ayrı ayrı Audit Log oluştur
            const auditLogs = materialIds.map(id => ({
                userId: session.user.id as string,
                action: auditAction,
                ipAddress: ip,
                details: `Toplu Moderasyon: Materyal ${id} -> ${newStatus}. Sebep: ${reason || "Belirtilmedi"}`
            }));

            await tx.auditLog.createMany({ data: auditLogs });
        });

        logger.info({ adminId: session.user.id, count: materialIds.length, action }, "Toplu moderasyon işlemi başarılı.");

        revalidatePath("/admin/materials/pending");
        revalidatePath("/admin/materials");
        revalidatePath("/admin/dashboard");

        return { success: true };
    } catch (error: any) {
        logger.error({ err: error, materialIds }, "Toplu moderasyon başarısız oldu.");
        return { success: false, error: error.message || "İşlem başarısız." };
    }
}