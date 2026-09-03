import { MetadataRoute } from "next";
import { prisma } from "@/infrastructure/database/prisma";
import { FileStatus, PostStatus, GradeLevel } from "@prisma/client";

// FIX 2: Root metadataBase ile aynı fallback origin kullanıldı (www kaldırıldı)
const getBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || "https://ogretmenbusra.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl();
    const sitemapEntries: MetadataRoute.Sitemap = [];

    // 1. STATİK SAYFALAR
    const staticRoutes = [
        "",
        "/materyaller",
        "/haberler",
        "/iletisim",
        "/hakkimizda",
        "/sss",
        "/gizlilik",
        "/cerezler",
        "/kullanim-kosullari"
    ];

    staticRoutes.forEach((route) => {
        sitemapEntries.push({
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: route === "" ? 1.0 : 0.8,
        });
    });

    try {
        // 2. MATERYALLER (Sadece APPROVED ve SLUG ile)
        const materials = await prisma.material.findMany({
            where: { status: FileStatus.APPROVED },
            select: { slug: true, updatedAt: true },
            orderBy: { updatedAt: "desc" },
        });

        materials.forEach((material) => {
            if (material.slug) {
                sitemapEntries.push({
                    url: `${baseUrl}/materyal/${material.slug}`,
                    lastModified: material.updatedAt,
                    changeFrequency: "monthly",
                    priority: 0.9,
                });
            }
        });

        // 3. GRADE LANDING PAGES (Sadece DOLU Sınıflar)
        const populatedGrades = await prisma.material.groupBy({
            by: ["grade"],
            where: { status: FileStatus.APPROVED },
            _count: { grade: true },
        });

        const gradeRouteMap: Record<GradeLevel, string> = {
            [GradeLevel.OKUL_ONCESI]: "okul-oncesi",
            [GradeLevel.SINIF_1]: "1-sinif",
            [GradeLevel.SINIF_2]: "2-sinif",
            [GradeLevel.SINIF_3]: "3-sinif",
            [GradeLevel.SINIF_4]: "4-sinif",
            [GradeLevel.GENEL]: "genel-materyaller",
        };

        populatedGrades.forEach((g) => {
            if (g._count.grade > 0 && gradeRouteMap[g.grade]) {
                sitemapEntries.push({
                    url: `${baseUrl}/${gradeRouteMap[g.grade]}`,
                    // FIX 1: Sahte new Date() tamamen kaldırıldı. lastModified omit edildi.
                    changeFrequency: "daily",
                    priority: 0.9,
                });
            }
        });

        // 4. HABERLER (Sadece PUBLISHED)
        const news = await prisma.news.findMany({
            where: { status: PostStatus.PUBLISHED },
            select: { slug: true, updatedAt: true },
            orderBy: { updatedAt: "desc" },
        });

        news.forEach((post) => {
            if (post.slug) {
                sitemapEntries.push({
                    url: `${baseUrl}/haberler/${post.slug}`,
                    lastModified: post.updatedAt,
                    changeFrequency: "weekly",
                    priority: 0.8,
                });
            }
        });

        // 5. YAZARLAR
        const authors = await prisma.material.groupBy({
            by: ["authorName"],
            where: { status: FileStatus.APPROVED },
        });

        authors.forEach((a) => {
            if (a.authorName) {
                sitemapEntries.push({
                    url: `${baseUrl}/yazar/${encodeURIComponent(a.authorName)}`,
                    lastModified: new Date(),
                    changeFrequency: "monthly",
                    priority: 0.6,
                });
            }
        });

    } catch (error) {
        console.error("[SITEMAP_ERROR] Sitemap veritabanı sorgularında hata oluştu:", error);
    }

    return sitemapEntries;
}