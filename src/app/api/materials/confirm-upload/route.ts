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

// Initialize Upstash Redis Ratelimit (Max 5 confirms per minute per IP)
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
});

export const POST = withErrorHandler(async (req: NextRequest) => {
    // 1. IP and Rate Limit Check
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    const { success: rateLimitSuccess } = await ratelimit.limit(`ratelimit:confirm_upload:${ipHash}`);
    if (!rateLimitSuccess) {
        return NextResponse.json({ error: "Çok fazla istek gönderildi. Lütfen bekleyin." }, { status: 429 });
    }

    // 2. CSRF / Strict Origin Check
    const origin = headerList.get("origin");
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || "https://ogretmenbusra.com";
    if (origin && !origin.includes("localhost") && origin !== allowedOrigin) {
        return NextResponse.json({ error: "Yetkisiz kaynak (Origin Mismatch)." }, { status: 403 });
    }

    // 3. Payload Validation
    const body = await req.json();
    const { materialId } = ConfirmSchema.parse(body);

    // 4. Cryptographic Identity & State Validation
    const material = await prisma.material.findUnique({
        where: { id: materialId },
        select: { ipHash: true, status: true }
    });

    if (!material) {
        return NextResponse.json({ error: "Materyal bulunamadı." }, { status: 404 });
    }

    if (material.status !== "UPLOAD_PENDING") {
        return NextResponse.json({ error: "Materyal zaten işlenmiş veya geçersiz durumda." }, { status: 400 });
    }

    // Ensure the user confirming the upload is the exact same user who requested the URL
    if (material.ipHash !== ipHash) {
        console.warn(`[SECURITY_ALERT] IP Hash mismatch on upload confirmation. Material: ${materialId}`);
        return NextResponse.json({ error: "Yetkisiz işlem. IP adresi eşleşmiyor." }, { status: 403 });
    }

    // 5. Confirm Upload
    await UploadService.confirmUploadSuccess(materialId);

    return NextResponse.json({ success: true, message: "Upload confirmed and pushed to moderation queue." });
});