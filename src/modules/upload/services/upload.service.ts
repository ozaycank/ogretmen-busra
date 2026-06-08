import { prisma } from "@/infrastructure/database/prisma";
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FileStatus, GradeLevel, ContentCategory } from "@prisma/client";
import crypto from "crypto";

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

        // 🚀 DÜZELTME: Fallback URL custom domain oldu
        const r2PublicUrl = process.env.R2_PUBLIC_URL || "https://r2.ogretmenbusra.com";

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
                turnstileToken: crypto.randomUUID(),
            }
        });

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: safeFileKey,
            ContentType: data.mimeType,
            ContentLength: data.fileSize,
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        return { signedUrl, materialId: fileId, fileKey: safeFileKey };
    }

    // 🚀 YENİ EKLENEN KORUMA: R2 üzerinde dosyanın gerçekten var olduğunu doğrular
    static async verifyFileExistsInR2(fileKey: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileKey,
            });
            await s3Client.send(command);
            return true; // Dosya fiziksel olarak storage'da var
        } catch (error: any) {
            if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
                return false; // Ghost record tespit edildi
            }
            throw error;
        }
    }

    static async rollbackFile(fileKey: string) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileKey,
            });
            await s3Client.send(command);
        } catch (error) {
            console.error(`[ROLLBACK_ERROR] Dosya silinemedi: ${fileKey}`, error);
        }
    }

    static async confirmUploadSuccess(materialId: string) {
        return prisma.material.update({
            where: { id: materialId },
            data: {
                scanResult: "Sistem tarafından güvenlik kuyruğuna alındı."
            }
        });
    }
}