import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 S3 Client Yapılandırması
const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
});

/**
 * Buffer verisini Cloudflare R2'ye yükler
 * @param fileBuffer Yüklenecek dosyanın buffer verisi
 * @param fileName Özgünleştirilmiş dosya adı
 * @param contentType Dosyanın MIME tipi
 * @returns Yüklenen dosyanın public URL'i
 */
export async function uploadToR2(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
    const bucketName = process.env.R2_BUCKET_NAME as string;
    const publicDomain = process.env.R2_PUBLIC_DOMAIN as string; // Örn: https://pub-xxxxxxxx.r2.dev

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
    });

    await s3Client.send(command);

    // Yüklenen dosyanın dışarıdan erişilebilir public linkini döndürüyoruz
    return `${publicDomain}/${fileName}`;
}