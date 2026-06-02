"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { FileStatus, AuditAction, Role } from "@prisma/client";
import { cookies, headers } from "next/headers";
import { jwtVerify } from "jose";
import { logger } from "@/lib/logger";

async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secure_super_secret_key_change_me");
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function moderateMaterial(materialId: string, action: "APPROVE" | "REJECT", reason?: string) {
    try {
        const session = await getSession();
        if (!session || (session.role !== Role.ADMIN && session.role !== Role.MODERATOR)) {
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
                scanResult: reason ? `Moderasyon Notu: ${reason}` : null // Basit not sistemi için scanResult alanını kullanıyoruz
            }
        });

        await prisma.auditLog.create({
            data: {
                userId: session.sub,
                action: auditAction,
                ipAddress: ip,
                details: `Materyal ID: ${materialId} | İşlem: ${action} | Sebep: ${reason || "Belirtilmedi"} | R2 Key: ${updated.fileKey}`
            }
        });

        logger.info({ adminId: session.sub, materialId, action }, "Moderasyon işlemi tamamlandı");

        // İşlem bitince listeye geri dön
    } catch (error) {
        logger.error({ err: error, materialId }, "Moderasyon başarısız");
        throw new Error("İşlem gerçekleştirilemedi.");
    }

    revalidatePath("/admin/materials");
    redirect("/admin/materials");
}