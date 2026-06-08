import NextAuth from "next-auth";
import { authConfig } from "@/modules/auth/config/auth.config";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const { auth } = NextAuth(authConfig);

// Edge Runtime için Redis İstemcisi
const getRedisClient = () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token || url.includes("your-upstash-url") || url.includes("placeholder")) return null;
    return new Redis({ url, token });
};

const redisClient = getRedisClient();
const ratelimit = redisClient
    ? new Ratelimit({ redis: redisClient, limiter: Ratelimit.slidingWindow(10, "10 s"), analytics: true })
    : null;

export default auth(async (req) => {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const path = req.nextUrl.pathname;

    // 1. Rate Limiting (Sadece API ve kritik POST istekleri için)
    if (ratelimit && (path.startsWith("/api/") || path.startsWith("/admin/login")) && req.method === "POST") {
        const { success } = await ratelimit.limit(`ratelimit_${ip}`);
        if (!success) {
            return new NextResponse(
                JSON.stringify({ error: "Çok fazla istek gönderildi. Lütfen bekleyin." }),
                { status: 429, headers: { "Content-Type": "application/json" } }
            );
        }
    }

    // 2. Public ve Statik Dosyaları Güvenlik Kontrolünden Hızlıca Geçir
    if (!path.startsWith("/admin") || path.match(/\.(.*)$/)) {
        return NextResponse.next();
    }

    // 3. Admin Route Koruması (Edge Authorization)
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;
    const isLoginPage = path.startsWith("/admin/login");

    if (isLoginPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        return NextResponse.next();
    }

    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    if (userRole !== "ADMIN" && userRole !== "MODERATOR") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/admin/materials/settings") && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    return NextResponse.next();
});

export const config = {
    // Sadece gerekli yollarda çalışmasını sağlayarak Vercel Edge faturalarını düşürürüz
    matcher: ['/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};