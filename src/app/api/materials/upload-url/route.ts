import { NextRequest, NextResponse } from "next/server";
import { UploadService } from "@/modules/upload/services/upload.service";
import { withErrorHandler } from "@/shared/utils/api-wrapper";
import { logger } from "@/infrastructure/logger";
import { z } from "zod";
import crypto from "crypto";

const InitializeUploadSchema = z.object({
    title: z.string().min(5).max(150),
    description: z.string().max(500).optional().nullable(),
    authorName: z.string().min(2).max(100),
    grade: z.enum(["OKUL_ONCESI", "SINIF_1", "SINIF_2", "SINIF_3", "SINIF_4", "GENEL"]),
    subject: z.string(),
    category: z.enum(["ETKINLIK", "ODEV", "KONU_ANLATIMI", "KODLAMA", "BELIRLI_GUN_VE_HAFTALAR", "UZMAN_NOTLARI", "SINIF_MATERYALLERI", "PIKTES_TURKCE", "DEGERLER_EGITIMI", "INTERAKTIF_OYUN"]),
    fileName: z.string(),
    fileSize: z.number().max(10 * 1024 * 1024, "Dosya 10MB'dan büyük olamaz"),
    mimeType: z.string(),
    turnstileToken: z.string().min(1, "Güvenlik doğrulaması zorunludur")
});

export const POST = withErrorHandler(async (req: NextRequest) => {
    const body = await req.json();
    const validatedData = InitializeUploadSchema.parse(body);

    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret && validatedData.turnstileToken) {
        const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${turnstileSecret}&response=${validatedData.turnstileToken}&remoteip=${ip}`,
        });
        const verifyOutcome = await verifyRes.json();

        if (!verifyOutcome.success) {
            return NextResponse.json({ error: "Güvenlik doğrulaması başarısız oldu (Bot algılandı)." }, { status: 403 });
        }
    }

    const result = await UploadService.generatePresignedUrl({
        ...validatedData,
        subject: validatedData.subject as any, // Enum eşleşmesi Prisma'da yakalanır
        ipHash
    });

    logger.info({ materialId: result.materialId, ipHash }, "Upload Presigned URL generated");

    return NextResponse.json({ success: true, ...result });
});