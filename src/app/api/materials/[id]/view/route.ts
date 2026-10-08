import {
    NextRequest,
    NextResponse,
} from "next/server";

import { Redis } from "@upstash/redis";

import {
    FileStatus,
} from "@prisma/client";

import { prisma } from "@/infrastructure/database/prisma";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const redis =
    process.env
        .UPSTASH_REDIS_REST_URL &&
        process.env
            .UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
            url:
                process.env
                    .UPSTASH_REDIS_REST_URL,
            token:
                process.env
                    .UPSTASH_REDIS_REST_TOKEN,
        })
        : null;

export async function POST(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            id: string;
        }>;
    },
) {
    const { id } =
        await params;

    if (!UUID_REGEX.test(id)) {
        return NextResponse.json(
            {
                error:
                    "Geçersiz materyal ID.",
            },
            {
                status: 400,
            },
        );
    }

    /*
     * Redis yoksa görüntülenme sayacı için DB'yi
     * kontrolsüz biçimde artırmıyoruz.
     */
    if (!redis) {
        return new NextResponse(
            null,
            {
                status: 204,
            },
        );
    }

    const ip =
        req.headers.get(
            "cf-connecting-ip",
        ) ||
        req.headers
            .get("x-forwarded-for")
            ?.split(",")[0]
            ?.trim() ||
        "127.0.0.1";

    const ipHash =
        await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(
                ip,
            ),
        );

    const ipHashHex =
        Array.from(
            new Uint8Array(ipHash),
        )
            .map((byte) =>
                byte
                    .toString(16)
                    .padStart(2, "0"),
            )
            .join("");

    const viewKey =
        `view:material:${id}:${ipHashHex}`;

    try {
        const isNewView =
            await redis.set(
                viewKey,
                "1",
                {
                    ex: 3600,
                    nx: true,
                },
            );

        if (!isNewView) {
            return new NextResponse(
                null,
                {
                    status: 204,
                },
            );
        }

        const updateResult =
            await prisma.material.updateMany({
                where: {
                    id,
                    status:
                        FileStatus.APPROVED,
                },

                data: {
                    viewCount: {
                        increment: 1,
                    },
                },
            });

        if (
            updateResult.count === 0
        ) {
            await redis.del(
                viewKey,
            );

            return NextResponse.json(
                {
                    error:
                        "Materyal bulunamadı veya yayında değil.",
                },
                {
                    status: 404,
                },
            );
        }

        return new NextResponse(
            null,
            {
                status: 204,
            },
        );
    } catch (error) {
        /*
         * DB update başarısız olduysa Redis anahtarı yüzünden
         * bir saat boyunca görüntülenme kaybolmasın.
         */
        try {
            await redis.del(
                viewKey,
            );
        } catch {
            // Analytics cleanup hatası kullanıcıya yansıtılmaz.
        }

        console.error(
            "[MATERIAL_VIEW_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Görüntülenme bilgisi kaydedilemedi.",
            },
            {
                status: 500,
            },
        );
    }
}