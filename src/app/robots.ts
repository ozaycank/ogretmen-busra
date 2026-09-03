import { MetadataRoute } from "next";

// FIX 2: Root metadataBase ile aynı fallback origin kullanıldı (www kaldırıldı)
const getBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || "https://ogretmenbusra.com";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getBaseUrl();

    return {
        rules: {
            userAgent: "*",
            allow: [
                "/",
                "/materyal/*",
                "/haberler/*",
                "/1-sinif",
                "/2-sinif",
                "/3-sinif",
                "/4-sinif",
                "/okul-oncesi",
                "/genel-materyaller"
            ],
            disallow: [
                "/admin/",
                "/admin/*",
                "/api/",
                "/api/*",
                "/_next/"
            ],
        },
        // Sitemap URL root domain (non-www) fallback'ine bağlandı
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}