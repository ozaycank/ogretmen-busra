import {
    NextRequest,
    NextResponse,
} from "next/server";
import {
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import {
    getSignedUrl,
} from "@aws-sdk/s3-request-presigner";
import { FileStatus } from "@prisma/client";

import { prisma } from "@/infrastructure/database/prisma";
import { s3Client } from "@/infrastructure/storage/r2";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function applyPrivateHeaders(
    response: NextResponse,
) {
    response.headers.set(
        "Cache-Control",
        "private, no-store, max-age=0",
    );

    response.headers.set(
        "X-Robots-Tag",
        "noindex, nofollow, noarchive",
    );

    return response;
}

export async function GET(req: NextRequest) {
    const id =
        req.nextUrl.searchParams.get("id");

    if (!id || !UUID_REGEX.test(id)) {
        return applyPrivateHeaders(
            NextResponse.json(
                {
                    error:
                        "Geçersiz veya eksik materyal ID'si.",
                },
                {
                    status: 400,
                },
            ),
        );
    }

    try {
        /*
         * Tek DB sorgusunda:
         * - materyalin APPROVED olduğunu doğruluyoruz
         * - downloadCount'u artırıyoruz
         * - sadece indirme için gereken alanları alıyoruz
         */
        const material =
            await prisma.material.update({
                where: {
                    id,
                    status: FileStatus.APPROVED,
                },

                data: {
                    downloadCount: {
                        increment: 1,
                    },
                },

                select: {
                    fileKey: true,
                    originalName: true,
                },
            });

        const command =
            new GetObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: material.fileKey,

                ResponseContentDisposition:
                    `attachment; filename*=UTF-8''${encodeURIComponent(
                        material.originalName,
                    )}`,
            });

        const signedUrl =
            await getSignedUrl(
                s3Client,
                command,
                {
                    expiresIn: 900,
                },
            );

        const response =
            NextResponse.redirect(
                signedUrl,
                307,
            );

        return applyPrivateHeaders(response);
    } catch (error) {
        const prismaErrorCode =
            typeof error === "object" &&
                error !== null &&
                "code" in error
                ? String(
                    (error as { code?: unknown })
                        .code ?? "",
                )
                : "";

        /*
         * Prisma P2025:
         * kayıt bulunamadı veya WHERE filtresine
         * uyan kayıt yok.
         */
        if (prismaErrorCode === "P2025") {
            return applyPrivateHeaders(
                NextResponse.json(
                    {
                        error:
                            "Materyal bulunamadı veya yayında değil.",
                    },
                    {
                        status: 404,
                    },
                ),
            );
        }

        console.error(
            "[DOWNLOAD_ERROR]",
            error,
        );

        return applyPrivateHeaders(
            NextResponse.json(
                {
                    error:
                        "Dosya indirilirken sunucu tarafında bir hata oluştu.",
                },
                {
                    status: 500,
                },
            ),
        );
    }
}