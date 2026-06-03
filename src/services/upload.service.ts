import { prisma } from "@/lib/db/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FileStatus, GradeLevel, ContentCategory } from "@prisma/client";
import crypto from "crypto";

// R2 Mimarisi
const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true,
});

interface InitializeUploadDTO {
    title: string;
    description?: string | null;
    authorName: string;
    grade: GradeLevel;
    category: ContentCategory;
    fileName: string;
    fileSize: number;
    mimeType: string;
    ipHash: string;
}

export class UploadService {
    static async generatePresignedUrl(data: InitializeUploadDTO) {
        const fileId = crypto.randomUUID();
        const extension = data.fileName.split('.').pop()?.toLowerCase() || "unknown";
        const safeFileKey = `uploads/materials/${fileId}.${extension}`;
        const r2PublicUrl = process.env.R2_PUBLIC_URL || "https://pub-r2.ogretmenbusra.com";

        // DB'ye Taslak Kayıt Ekle (UPLOAD_PENDING)
        await prisma.material.create({
            data: {
                id: fileId,
                title: data.title,
                description: data.description,
                authorName: data.authorName,
                grade: data.grade,
                category: data.category,
                originalName: data.fileName,
                fileKey: safeFileKey,
                fileUrl: `${r2PublicUrl}/${safeFileKey}`,
                fileSize: data.fileSize,
                fileType: extension,
                mimeType: data.mimeType,
                status: FileStatus.UPLOAD_PENDING,
                ipHash: data.ipHash,
                turnstileToken: crypto.randomUUID(), // Bot koruma atlandı (Opsiyonel olarak gerçeği eklenecek)
            }
        });

        // Presigned URL Üret (5 DK)
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: safeFileKey,
            ContentType: data.mimeType,
            ContentLength: data.fileSize,
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        return { signedUrl, materialId: fileId, fileKey: safeFileKey };
    }

    // YENİ: İstemci yüklemeyi bitirdiğinde çalışacak onaylama servisi
    static async confirmUploadSuccess(materialId: string) {
        // İleride burada QStash webhook'u tetiklenebilir (PROCESSING'e çeker)
        // Şimdilik test ve moderasyon için doğrudan kuyruğa (UPLOAD_PENDING kalarak onay ekranına düşmesini) sağlıyoruz.
        return prisma.material.update({
            where: { id: materialId },
            data: {
                // Gerçek mimaride burada status: "PROCESSING" olur ve webhook tetiklenir
                // Sistemde henüz Worker aktif olmadığı için direkt "UPLOAD_PENDING" kalarak Admin onayına düşmesini sağlıyoruz.
                scanResult: "Sistem tarafından güvenlik kuyruğuna alındı."
            }
        });
    }
}