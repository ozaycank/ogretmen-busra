import { z } from "zod";
import { getNewsPlainText } from "@/modules/news/utils/news-content";

export const NewsSchema = z.object({
    title: z
        .string()
        .trim()
        .min(5, "Başlık en az 5 karakter olmalıdır.")
        .max(200, "Başlık en fazla 200 karakter olabilir."),

    slug: z
        .string()
        .trim()
        .min(3, "Slug en az 3 karakter olmalıdır.")
        .max(255, "Slug en fazla 255 karakter olabilir.")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug sadece küçük harf, rakam ve tire içerebilir."
        ),

    content: z.string().refine(
        (value) => {
            const plainText = getNewsPlainText(value);
            return plainText.length >= 10;
        },
        {
            message:
                "İçerik çok kısa. Lütfen daha detaylı bir metin girin.",
        }
    ),

    label: z
        .string()
        .trim()
        .min(2, "Lütfen bir etiket (kategori) seçin.")
        .max(50, "Kategori etiketi en fazla 50 karakter olabilir."),

    imageUrl: z
        .string()
        .trim()
        .url("Geçerli bir görsel URL'si girin.")
        .optional()
        .or(z.literal("")),

    status: z.enum([
        "DRAFT",
        "PUBLISHED",
        "ARCHIVED",
    ]),

    seoTitle: z
        .string()
        .trim()
        .max(
            60,
            "SEO Başlığı 60 karakteri aşmamalıdır."
        )
        .optional()
        .or(z.literal("")),

    seoDescription: z
        .string()
        .trim()
        .max(
            160,
            "SEO Açıklaması 160 karakteri aşmamalıdır."
        )
        .optional()
        .or(z.literal("")),
});

export type NewsFormData = z.infer<typeof NewsSchema>;