import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";
import { FileStatus, GradeLevel, ContentCategory } from "@prisma/client";
import { logger } from "@/lib/logger";

// Cloudflare R2 İstemcisi
const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB Sınırı

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, description, authorName, grade, category, fileName, fileSize, mimeType } = body;

        // 1. Girdi Doğrulama (Sanitization & Validation)
        if (!title || title.length > 150) return NextResponse.json({ error: "Geçersiz başlık uzunluğu." }, { status: 400 });
        if (!authorName || authorName.length > 100) return NextResponse.json({ error: "Geçersiz yazar adı." }, { status: 400 });
        if (fileSize > MAX_FILE_SIZE) return NextResponse.json({ error: "Dosya boyutu 10MB'ı aşamaz." }, { status: 400 });

        // 2. Güvenlik: Bot Doğrulaması (Turnstile / reCAPTCHA burada entegre edilir)
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

        // 3. Dosya Adı ve Yolu Oluşturma
        const fileId = crypto.randomUUID();
        const extension = fileName.split('.').pop()?.toLowerCase() || "unknown";
        const safeFileKey = `uploads/materials/${fileId}.${extension}`;
        const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-r2.busraogretmen.com";

        // 4. Veritabanında Taslak (Pending) Kayıt Oluştur
        const material = await prisma.material.create({
            data: {
                id: fileId,
                title,
                description,
                authorName,
                grade: grade as GradeLevel,
                category: category as ContentCategory,
                originalName: fileName,
                fileKey: safeFileKey,
                fileUrl: `${R2_PUBLIC_URL}/${safeFileKey}`,
                fileSize,
                fileType: extension,
                mimeType,
                status: FileStatus.UPLOAD_PENDING,
                ipHash,
                turnstileToken: crypto.randomUUID(), // Gerçek implementasyonda client'tan gelir
            }
        });

        // 5. R2 Presigned URL Üretimi (Sadece 5 dakika geçerli)
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: safeFileKey,
            ContentType: mimeType,
            ContentLength: fileSize,
        });

        const signedUrl = await getSignedUrl(S3, command, { expiresIn: 300 });

        logger.info({ materialId: fileId, ipHash }, "Presigned URL üretildi.");

        return NextResponse.json({
            signedUrl,
            materialId: material.id,
            fileKey: safeFileKey
        });

    } catch (error) {
        logger.error({ err: error }, "Upload URL oluşturulurken hata");
        return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
    }
}