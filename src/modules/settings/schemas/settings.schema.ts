import { z } from "zod";

export const ModerationSettingsSchema = z.object({
    // Upload Rules
    maxFileSizeMB: z.number().min(1).max(100),
    allowedExtensions: z.array(z.string()).min(1),
    dailyUploadLimitPerIP: z.number().min(1).max(1000),

    // Security Settings
    requireMagicByteCheck: z.boolean(),
    requireAntivirusScan: z.boolean(),
    preventDuplicateHashes: z.boolean(),

    // Workflow & SLA
    autoApproveRiskThreshold: z.number().min(0).max(100),
    manualReviewRiskThreshold: z.number().min(0).max(100),
    targetReviewTimeHours: z.number().min(1).max(168),

    // Risk Scoring Weights
    weightNewAccount: z.number().min(0).max(100),
    weightDuplicate: z.number().min(0).max(100),
    weightMalwareWarning: z.number().min(0).max(100),

    // Retention
    rejectedRetentionDays: z.number().min(0).max(365),
    logRetentionDays: z.number().min(30).max(3650),
});

export type ModerationSettingsData = z.infer<typeof ModerationSettingsSchema>;

// Varsayılan Ayarlar
export const defaultModerationSettings: ModerationSettingsData = {
    maxFileSizeMB: 10,
    allowedExtensions: ["pdf", "docx", "zip", "png", "jpg"],
    dailyUploadLimitPerIP: 20,
    requireMagicByteCheck: true,
    requireAntivirusScan: true,
    preventDuplicateHashes: true,
    autoApproveRiskThreshold: 15,
    manualReviewRiskThreshold: 50,
    targetReviewTimeHours: 24,
    weightNewAccount: 20,
    weightDuplicate: 40,
    weightMalwareWarning: 100,
    rejectedRetentionDays: 30,
    logRetentionDays: 730,
};