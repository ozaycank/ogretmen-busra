import { prisma } from "@/infrastructure/database/prisma";
import { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FileStatus, GradeLevel, ContentCategory, SubjectType } from "@prisma/client";
import { s3Client } from "@/infrastructure/storage/r2";
import crypto from "crypto";

interface InitializeUploadDTO {
    title: string;
    description?: string | null;
    authorName: string;
    grade: GradeLevel;
    subject: SubjectType;
    category: ContentCategory;
    fileName: string;
    fileSize: number;
    mimeType: string;
    ipHash: string;
    turnstileToken: string;
}

export class UploadService {
    static async generatePresignedUrl(data: InitializeUploadDTO) {
        const fileId = crypto.randomUUID();
        const extension = data.fileName.split('.').pop()?.toLowerCase() || "unknown";
        const safeFileKey = `uploads/materials/${fileId}.${extension}`;

        const r2PublicUrl = process.env.R2_PUBLIC_URL || "https://r2.ogretmenbusra.com";

        await prisma.material.create({
            data: {
                id: fileId,
                title: data.title,
                description: data.description,
                authorName: data.authorName,
                grade: data.grade,
                subject: data.subject,
                category: data.category,
                originalName: data.fileName,
                fileKey: safeFileKey,
                fileUrl: `${r2PublicUrl}/${safeFileKey}`,
                fileSize: data.fileSize,
                fileType: extension,
                mimeType: data.mimeType,
                status: FileStatus.UPLOAD_PENDING,
                ipHash: data.ipHash,
                turnstileToken: data.turnstileToken,
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

    static async verifyFileExistsInR2(fileKey: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileKey,
            });
            await s3Client.send(command);
            return true;
        } catch (error: any) {
            if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
                return false;
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