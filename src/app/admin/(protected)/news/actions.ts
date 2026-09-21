"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/database/prisma";
import {
    NewsSchema,
    NewsFormData,
} from "@/modules/news/schemas/news.schema";
import { sanitizeNewsHtml } from "@/modules/news/utils/news-content.server";
import { getNewsPlainText } from "@/modules/news/utils/news-content";
import { auth } from "@/auth";

async function verifyAdmin() {
    const session = await auth();

    if (
        !session?.user ||
        (
            session.user.role !== "ADMIN" &&
            session.user.role !== "MODERATOR"
        )
    ) {
        throw new Error("Yetkisiz işlem");
    }

    return session.user;
}

export async function saveNews(
    id: string | null,
    data: NewsFormData
) {
    try {
        await verifyAdmin();

        const validated = NewsSchema.parse(data);

        /**
         * ReactQuill HTML'i burada gerçek allow-list sanitizer'dan geçer.
         *
         * Dikkat:
         * Bu yalnızca kaydedilmekte olan habere uygulanır.
         * Veritabanındaki diğer haberler üzerinde toplu işlem yapılmaz.
         */
        const sanitizedContent = sanitizeNewsHtml(
            validated.content
        );

        const sanitizedPlainText =
            getNewsPlainText(sanitizedContent);

        if (sanitizedPlainText.length < 10) {
            throw new Error(
                "İçerik temizlendikten sonra çok kısa kaldı."
            );
        }

        let existing:
            | {
                slug: string;
                publishedAt: Date | null;
            }
            | null = null;

        if (id) {
            existing = await prisma.news.findUnique({
                where: { id },
                select: {
                    slug: true,
                    publishedAt: true,
                },
            });

            if (!existing) {
                throw new Error("Güncellenecek haber bulunamadı.");
            }
        }

        /**
         * Haber daha önce yayınlandıysa publishedAt değerini koruyoruz.
         *
         * Böylece ileride haber düzenlenirken yayın tarihi her kayıtta
         * tekrar bugüne dönmez.
         */
        const publishedAt =
            validated.status === "PUBLISHED"
                ? existing?.publishedAt ?? new Date()
                : null;

        const payload = {
            ...validated,
            content: sanitizedContent,
            publishedAt,
        };

        let newsId = id;

        if (id) {
            await prisma.news.update({
                where: { id },
                data: payload,
            });
        } else {
            const created = await prisma.news.create({
                data: payload,
            });

            newsId = created.id;
        }

        revalidatePath("/");
        revalidatePath("/admin/news");
        revalidatePath("/haberler");
        revalidatePath(`/haberler/${validated.slug}`);

        if (
            existing?.slug &&
            existing.slug !== validated.slug
        ) {
            revalidatePath(`/haberler/${existing.slug}`);
        }

        return {
            success: true,
            id: newsId,
        };
    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? error.message
                : "Kaydetme başarısız.";

        return {
            success: false,
            error: message,
        };
    }
}

export async function deleteNews(id: string) {
    try {
        await verifyAdmin();

        await prisma.news.delete({
            where: { id },
        });

        revalidatePath("/");
        revalidatePath("/admin/news");
        revalidatePath("/haberler");

        return {
            success: true,
        };
    } catch {
        return {
            success: false,
            error: "Silme işlemi başarısız.",
        };
    }
}