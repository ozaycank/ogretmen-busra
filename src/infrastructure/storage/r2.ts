import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Global Singleton Instance for S3Client (Vercel Serverless Memory Optimization)
const globalForS3 = globalThis as unknown as { s3Client: S3Client | undefined };

export const s3Client = globalForS3.s3Client ?? new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
    // Cloudflare R2 tam S3 uyumluluğu için bu parametre zorunludur
    forcePathStyle: true,
});

if (process.env.NODE_ENV !== "production") {
    globalForS3.s3Client = s3Client;
}

/**
 * Buffer verisini Cloudflare R2'ye yükler.
 * UYARI: Bu metod yalnızca Vercel 4.5MB Payload limitinin altındaki 
 * küçük dosyalar (Örn: Profil resmi, Thumbnail) için kullanılmalıdır.
 * Büyük dosyalar Presigned URL akışı ile yüklenmelidir.
 * * @param fileBuffer Yüklenecek dosyanın buffer verisi
 * @param fileName Özgünleştirilmiş dosya adı
 * @param contentType Dosyanın MIME tipi
 * @returns Yüklenen dosyanın public URL'i
 */
export async function uploadToR2(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
    const bucketName = process.env.R2_BUCKET_NAME as string;
    const publicDomain = process.env.R2_PUBLIC_URL as string;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
    });

    await s3Client.send(command);

    return `${publicDomain}/${fileName}`;
}