"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/database/prisma";
import { FileStatus, AuditAction, Role } from "@prisma/client";
import { cookies, headers } from "next/headers";
import { jwtVerify } from "jose";
import { logger } from "@/infrastructure/logger";

async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) throw new Error("Oturum bulunamadı");

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secure_super_secret_key_change_me");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== Role.ADMIN && payload.role !== Role.MODERATOR) throw new Error("Yetkisiz işlem");

    return payload;
}

export async function bulkModerateMaterials(materialIds: string[], action: "APPROVE" | "REJECT", reason?: string) {
    try {
        const session = await getSession();
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "unknown";

        const newStatus = action === "APPROVE" ? FileStatus.APPROVED : FileStatus.REJECTED;
        const auditAction = action === "APPROVE" ? AuditAction.MATERIAL_APPROVED : AuditAction.MATERIAL_REJECTED;

        // Transaction-Safe Bulk Execution
        // Eğer biri başarısız olursa hiçbiri güncellenmez (SOLID & Enterprise Pattern)
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
                userId: session.sub as string,
                action: auditAction,
                ipAddress: ip,
                details: `Toplu Moderasyon: Materyal ${id} -> ${newStatus}. Sebep: ${reason || "Belirtilmedi"}`
            }));

            await tx.auditLog.createMany({ data: auditLogs });
        });

        logger.info({ adminId: session.sub, count: materialIds.length, action }, "Toplu moderasyon işlemi başarılı.");

        revalidatePath("/admin/materials/pending");
        revalidatePath("/admin/materials");
        revalidatePath("/admin/dashboard");

        return { success: true };
    } catch (error: any) {
        logger.error({ err: error, materialIds }, "Toplu moderasyon başarısız oldu.");
        return { success: false, error: error.message || "İşlem başarısız." };
    }
}