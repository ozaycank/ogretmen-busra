import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ogretmenbusra.com";

    // Production ortamında (Vercel/Canlı) arama motorlarına tam yetki verilir.
    // Development veya Staging (Test) ortamlarında ise indexleme kapatılır.
    const isProduction = process.env.NODE_ENV === "production";

    return {
        rules: {
            userAgent: "*",
            // Sadece Production ortamında sayfalara izin ver, diğerlerinde her şeyi engelle
            allow: isProduction ? ["/"] : [],
            disallow: [
                "/admin",           // Admin panelini ve alt sayfalarını tamamen gizle
                "/admin/*",
                "/api",             // API rotalarının arama sonuçlarında çıkmasını engelle
                "/api/*",
                "/_next/",          // Next.js iç dosya ve statik derlemelerini gizle
                "/*.json$",         // Sızabilecek konfigürasyon veya data dosyalarını koru
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
        // Google botlarına sitemizin ana URL'ini direkt olarak ver
        host: baseUrl,
    };
}