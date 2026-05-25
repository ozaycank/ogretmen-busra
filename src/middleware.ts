import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const { auth } = NextAuth(authConfig);

// Upstash Redis ile Rate Limiting (Vercel KV)
// 10 saniyede maksimum 5 istek (API bot saldırılarına karşı)
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "10 s"),
    analytics: true,
});

export default auth(async (req) => {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const path = req.nextUrl.pathname;

    // 1. API Rate Limiting (Sadece POST isteklerini ve hassas API'leri sınırla)
    if (path.startsWith("/api/materials") && req.method === "POST") {
        try {
            const { success, limit, reset, remaining } = await ratelimit.limit(`ratelimit_${ip}`);

            if (!success) {
                return NextResponse.json(
                    { error: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." },
                    {
                        status: 429,
                        headers: {
                            "X-RateLimit-Limit": limit.toString(),
                            "X-RateLimit-Remaining": remaining.toString(),
                            "X-RateLimit-Reset": reset.toString(),
                        }
                    }
                );
            }
        } catch (error) {
            console.error("Rate limit sunucusuna ulaşılamadı:", error);
            // Redis çökerse sistemi kilitlememek için geçişe izin ver
        }
    }

    // NextAuth yetkilendirmesi `authConfig` callback'i üzerinden otomatik çalışır
    return NextResponse.next();
});

// Middleware'in çalışacağı rotaları (Regex ile) sınırla (Performans için)
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};