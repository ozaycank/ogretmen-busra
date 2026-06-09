import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { prisma } from "@/infrastructure/database/prisma";
import { UploadService } from "@/modules/upload/services/upload.service";
import { withErrorHandler } from "@/shared/utils/api-wrapper";

const ConfirmSchema = z.object({
    materialId: z.string().uuid()
});

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
});

export const POST = withErrorHandler(async (req: NextRequest) => {
    const headerList = await headers();
    // Güvenli IP tespiti
    const ip = headerList.get("cf-connecting-ip") || headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    const { success: rateLimitSuccess } = await ratelimit.limit(`ratelimit:confirm_upload:${ipHash}`);
    if (!rateLimitSuccess) {
        return NextResponse.json({ error: "Çok fazla istek gönderildi. Lütfen bekleyin." }, { status: 429 });
    }

    const body = await req.json();
    const { materialId } = ConfirmSchema.parse(body);

    const material = await prisma.material.findUnique({
        where: { id: materialId },
        select: { ipHash: true, status: true, fileKey: true }
    });

    if (!material) {
        return NextResponse.json({ error: "Materyal bulunamadı." }, { status: 404 });
    }

    if (material.status !== "UPLOAD_PENDING") {
        return NextResponse.json({ error: "Materyal zaten işlenmiş veya geçersiz durumda." }, { status: 400 });
    }

    if (material.ipHash !== ipHash) {
        return NextResponse.json({ error: "Yetkisiz işlem. IP adresi eşleşmiyor." }, { status: 403 });
    }

    const fileExists = await UploadService.verifyFileExistsInR2(material.fileKey);

    if (!fileExists) {
        await prisma.material.delete({ where: { id: materialId } });
        console.error(`[UPLOAD_FAILED] Ghost Record engellendi. Material: ${materialId}`);
        return NextResponse.json({
            error: "Dosya Cloudflare sunucularına ulaşılamadı. Lütfen ağ bağlantınızı kontrol edip tekrar deneyin."
        }, { status: 400 });
    }

    await UploadService.confirmUploadSuccess(materialId);

    return NextResponse.json({ success: true, message: "Upload confirmed and pushed to moderation queue." });
});