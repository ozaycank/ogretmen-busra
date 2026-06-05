import { MetadataRoute } from "next";
import { prisma } from "@/infrastructure/database/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ogretmenbusra.com";

    // 1. Statik Sayfalar (Öncelik sırasına göre)
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
        { url: `${baseUrl}/materyaller`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${baseUrl}/haberler`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
        { url: `${baseUrl}/materyal-ekle`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
        { url: `${baseUrl}/hakkimizda`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
        { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
        { url: `${baseUrl}/sss`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
        { url: `${baseUrl}/kvkk-aydinlatma-metni`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
        { url: `${baseUrl}/gizlilik`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
        { url: `${baseUrl}/kullanim-kosullari`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
        { url: `${baseUrl}/cerezler`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
        { url: `${baseUrl}/telif`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ];

    // 2. Dinamik Verileri Çekme (Performans için Promise.all ile paralel istek)
    const [materials, news, authors] = await Promise.all([
        prisma.material.findMany({
            where: { status: "APPROVED" }, // Sadece onaylı materyaller
            select: { id: true, updatedAt: true },
            orderBy: { updatedAt: "desc" }
        }),
        prisma.news.findMany({
            where: { status: "PUBLISHED" }, // Sadece yayınlanmış haberler
            select: { slug: true, updatedAt: true }, // SEO için slug kullanımı
            orderBy: { updatedAt: "desc" }
        }),
        prisma.material.findMany({
            where: { status: "APPROVED" },
            select: { authorName: true, updatedAt: true },
            distinct: ["authorName"], // Her yazar için tek bir sayfa oluşturmak adına
            orderBy: { updatedAt: "desc" }
        })
    ]);

    // 3. Dinamik Rotaları Sitemap Formatına Çevirme
    const materialRoutes: MetadataRoute.Sitemap = materials.map((material) => ({
        url: `${baseUrl}/materyal/${material.id}`,
        lastModified: material.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const newsRoutes: MetadataRoute.Sitemap = news.map((post) => ({
        url: `${baseUrl}/haberler/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    const authorRoutes: MetadataRoute.Sitemap = authors.map((author) => ({
        // Yazar isimlerinde boşluk/Türkçe karakter olabileceği için URL Encoding yapıyoruz
        url: `${baseUrl}/yazar/${encodeURIComponent(author.authorName)}`,
        lastModified: author.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
    }));

    // Tüm rotaları birleştirip döndür
    return [...staticRoutes, ...materialRoutes, ...newsRoutes, ...authorRoutes];
}