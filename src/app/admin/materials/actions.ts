"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { FileStatus, AuditAction, Role } from "@prisma/client";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";

// Mock Session (Gerçek Auth entegrasyonunda değiştirilecek)
async function getAdminSession() {
    return { user: { id: "admin-1", role: Role.ADMIN } };
}

export async function updateMaterialStatus(materialId: string, newStatus: FileStatus) {
    try {
        const session = await getAdminSession();
        if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.MODERATOR)) {
            throw new Error("Yetkisiz işlem.");
        }

        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "unknown";

        // Durumu güncelle
        const updated = await prisma.material.update({
            where: { id: materialId },
            data: { status: newStatus }
        });

        // Denetim Günlüğü (Audit Log) Tut
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: newStatus === "APPROVED" ? AuditAction.MATERIAL_APPROVED : AuditAction.MATERIAL_DELETED,
                ipAddress: ip,
                details: `Materyal ${newStatus} durumuna çekildi: ${updated.title} (${updated.id})`
            }
        });

        // Önbelleği temizle (Sayfa verilerini yenile)
        revalidatePath("/admin/materials");
        revalidatePath("/admin/dashboard");

        return { success: true };
    } catch (error) {
        logger.error({ err: error, materialId }, "Materyal durumu güncellenirken hata");
        return { success: false, error: "İşlem başarısız oldu." };
    }
}

export async function bulkUpdateStatus(materialIds: string[], newStatus: FileStatus) {
    try {
        const session = await getAdminSession();
        if (!session || session.user.role !== Role.ADMIN) {
            throw new Error("Toplu işlem için Admin yetkisi gereklidir.");
        }

        await prisma.material.updateMany({
            where: { id: { in: materialIds } },
            data: { status: newStatus }
        });

        revalidatePath("/admin/materials");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Toplu işlem başarısız." };
    }
}