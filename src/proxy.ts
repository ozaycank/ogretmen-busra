import NextAuth from "next-auth";
import { authConfig } from "@/modules/auth/config/auth.config";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { AnalyticsService } from "@/modules/analytics/services/analytics.service";

const { auth } = NextAuth(authConfig);

// Güvenli Redis Başlatma (Hatalı/Eksik env durumlarında sistemi çökertmez)
const getRedisClient = () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token || url.includes("your-upstash-url") || url.includes("placeholder")) return null;
    return new Redis({ url, token });
};

const redisClient = getRedisClient();
const ratelimit = redisClient
    ? new Ratelimit({ redis: redisClient, limiter: Ratelimit.slidingWindow(5, "10 s"), analytics: true })
    : null;

export default auth(async (req) => {
    const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-request-id", requestId);

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const path = req.nextUrl.pathname;

    // Sadece Redis aktifse Rate Limit uygula (Development'ta kilitlenmeyi önler)
    if (ratelimit && path.startsWith("/api/") && req.method === "POST") {
        const { success } = await ratelimit.limit(`ratelimit_${ip}`);
        if (!success) {
            return NextResponse.json(
                { error: "Çok fazla istek gönderildi. Lütfen bekleyin.", requestId },
                { status: 429, headers: { "x-request-id": requestId } }
            );
        }
    }

    // İstatistik ve Ziyaretçi Takibi (Sadece sayfalar için çalışır)
    if (!path.startsWith("/api/") && !path.startsWith("/admin") && !path.match(/\.(.*)$/)) {
        // KVKK Uyumlu IP Hashing
        const dataToHash = new TextEncoder().encode(ip + userAgent + new Date().toISOString().split("T")[0]);
        crypto.subtle.digest("SHA-256", dataToHash).then((hashBuffer) => {
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const ipHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);

            // Asenkron olarak Redis'e yaz (Kullanıcıyı bloklamaz)
            AnalyticsService.trackVisit(ipHash);
        }).catch(err => console.error("Hash calculation failed:", err));
    }

    // RBAC: Yetki Kontrolleri
    const userRole = req.auth?.user?.role;

    if (path.startsWith("/admin/materials/settings") && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    if (path.startsWith("/admin") && !["ADMIN", "MODERATOR"].includes(userRole as string)) {
        if (req.auth) return NextResponse.redirect(new URL("/", req.url));
    }

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("x-request-id", requestId);
    return response;
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};