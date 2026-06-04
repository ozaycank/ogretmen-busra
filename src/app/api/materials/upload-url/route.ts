import { NextRequest, NextResponse } from "next/server";
import { UploadService } from "@/modules/upload/services/upload.service";
import { withErrorHandler } from "@/shared/utils/api-wrapper"; import { logger } from "@/infrastructure/logger";
import { z } from "zod";
import crypto from "crypto";

// API için Client'tan gelen datayı karşılayacak özel Zod şeması
const InitializeUploadSchema = z.object({
    title: z.string().min(5).max(150),
    description: z.string().max(500).optional().nullable(),
    authorName: z.string().min(2).max(100),
    grade: z.enum(["OKUL_ONCESI", "SINIF_1", "SINIF_2", "SINIF_3", "SINIF_4", "GENEL"]),
    category: z.enum(["ETKINLIK", "ODEV", "KONU_ANLATIMI", "KODLAMA", "BELIRLI_GUN_VE_HAFTALAR", "UZMAN_NOTLARI", "SINIF_MATERYALLERI", "PIKTES_TURKCE", "DEGERLER_EGITIMI", "INTERAKTIF_OYUN"]),
    fileName: z.string(),
    fileSize: z.number().max(10 * 1024 * 1024, "Dosya 10MB'dan büyük olamaz"),
    mimeType: z.string()
});

export const POST = withErrorHandler(async (req: NextRequest) => {
    // 1. Zod ile Payload Doğrulaması
    const body = await req.json();
    const validatedData = InitializeUploadSchema.parse(body);

    // 2. IP Hash İşlemi
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    // 3. Service Layer Çağrısı
    const result = await UploadService.generatePresignedUrl({
        ...validatedData,
        ipHash
    });

    logger.info({ materialId: result.materialId, ipHash }, "Upload Presigned URL generated");

    return NextResponse.json(result);
});