import { z } from "zod";

export const NewsSchema = z.object({
    title: z.string().min(5, "Başlık en az 5 karakter olmalıdır.").max(200),
    slug: z.string().min(3).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug sadece küçük harf, rakam ve tire içerebilir."),
    content: z.string().min(20, "İçerik çok kısa."),
    label: z.string().min(2, "Lütfen bir etiket (kategori) seçin."),
    imageUrl: z.string().url("Geçerli bir görsel URL'si girin.").optional().or(z.literal("")),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
    seoTitle: z.string().max(60, "SEO Başlığı 60 karakteri aşmamalıdır.").optional().or(z.literal("")),
    seoDescription: z.string().max(160, "SEO Açıklaması 160 karakteri aşmamalıdır.").optional().or(z.literal("")),
});

export type NewsFormData = z.infer<typeof NewsSchema>;