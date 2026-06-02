"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { ModerationSettingsSchema, ModerationSettingsData, defaultModerationSettings } from "@/schemas/settings.schema";
import { AuditAction, Role } from "@prisma/client";
import { cookies, headers } from "next/headers";
import { jwtVerify } from "jose";
import { logger } from "@/lib/logger";

const SETTING_KEY = "MODERATION_RULES";

async function verifySuperAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) throw new Error("Yetkisiz");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secure_super_secret_key_change_me");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== Role.ADMIN) throw new Error("Bu sayfaya sadece Süper Admin erişebilir.");
    return payload;
}

export async function getModerationSettings(): Promise<ModerationSettingsData> {
    const setting = await prisma.systemSetting.findUnique({ where: { key: SETTING_KEY } });
    if (!setting) return defaultModerationSettings;
    return setting.value as unknown as ModerationSettingsData;
}

export async function updateModerationSettings(data: ModerationSettingsData, reason?: string) {
    try {
        const admin = await verifySuperAdmin();
        const validated = ModerationSettingsSchema.parse(data);

        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "unknown";

        const currentSetting = await prisma.systemSetting.findUnique({ where: { key: SETTING_KEY } });

        // Transaction ile ayarı güncelle ve History logu at
        await prisma.$transaction(async (tx) => {
            await tx.systemSetting.upsert({
                where: { key: SETTING_KEY },
                update: { value: validated, updatedBy: admin.sub },
                create: { key: SETTING_KEY, value: validated, updatedBy: admin.sub },
            });

            await tx.settingHistory.create({
                data: {
                    settingKey: SETTING_KEY,
                    oldValue: currentSetting?.value || {},
                    newValue: validated,
                    changedBy: admin.sub as string,
                    reason: reason || "Genel ayar güncellemesi",
                }
            });

            // Audit Log
            await tx.auditLog.create({
                data: {
                    userId: admin.sub as string,
                    action: AuditAction.MATERIAL_APPROVED, // Şemada SETTING_CHANGED olmadığı için geçici kullanıyoruz
                    ipAddress: ip,
                    details: `Moderasyon ayarları güncellendi. ${reason ? `Sebep: ${reason}` : ''}`
                }
            });
        });

        logger.info({ adminId: admin.sub }, "Moderasyon ayarları güncellendi.");
        revalidatePath("/admin/materials/settings");
        return { success: true };
    } catch (error: any) {
        logger.error({ err: error }, "Ayarlar güncellenirken hata.");
        return { success: false, error: error.message || "İşlem başarısız." };
    }
}