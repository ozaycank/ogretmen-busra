"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/database/prisma";
import { ModerationSettingsSchema, ModerationSettingsData, defaultModerationSettings } from "@/modules/settings/schemas/settings.schema";
import { AuditAction } from "@prisma/client";
import { headers } from "next/headers";
import { logger } from "@/infrastructure/logger";
import { auth } from "@/auth";

const SETTING_KEY = "MODERATION_RULES";

async function verifySuperAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Bu işlem için Süper Admin yetkisi gereklidir.");
    }
    return session.user;
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
                update: { value: validated, updatedBy: admin.id },
                create: { key: SETTING_KEY, value: validated, updatedBy: admin.id },
            });

            await tx.settingHistory.create({
                data: {
                    settingKey: SETTING_KEY,
                    oldValue: currentSetting?.value || {},
                    newValue: validated,
                    changedBy: admin.id as string,
                    reason: reason || "Genel ayar güncellemesi",
                }
            });

            // Audit Log
            await tx.auditLog.create({
                data: {
                    userId: admin.id as string,
                    action: AuditAction.MATERIAL_APPROVED, // Şemada SETTING_CHANGED olmadığı için geçici kullanıyoruz
                    ipAddress: ip,
                    details: `Moderasyon ayarları güncellendi. ${reason ? `Sebep: ${reason}` : ''}`
                }
            });
        });

        logger.info({ adminId: admin.id }, "Moderasyon ayarları güncellendi.");
        revalidatePath("/admin/materials/settings");
        return { success: true };
    } catch (error: any) {
        logger.error({ err: error }, "Ayarlar güncellenirken hata.");
        return { success: false, error: error.message || "İşlem başarısız." };
    }
}