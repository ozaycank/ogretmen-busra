import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export class UploadService {
    /**
     * 1. İstemciye doğrudan yükleme yapması için zaman aşımı olan bir imza üretir.
     */
    static async generateSignedUrl(fileName: string, mimeType: string, ip: string) {
        const fileExtension = fileName.split('.').pop();
        // Güvenlik: Tahmin edilemez dosya isimleri (Path Traversal'ı engeller)
        const fileKey = `${crypto.randomUUID()}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
            ContentType: mimeType,
            // 5MB limiti örneği (Bulut seviyesinde kısıtlama)
            ContentLength: 5 * 1024 * 1024,
        });

        // URL sadece 5 dakika geçerlidir
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        return { signedUrl, fileKey };
    }

    /**
     * Hata anında veya virüs bulunduğunda Rollback (R2'den temizleme)
     */
    static async rollbackFile(fileKey: string) {
        await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
        }));
    }
}