import NextAuth from "next-auth";
import { authConfig } from "./config/auth.config";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { AnalyticsService } from "./services/analytics.service";

const { auth } = NextAuth(authConfig);
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "10 s"),
    analytics: true,
});

export default auth(async (req) => {
    // İzleme (Tracing) için benzersiz ID oluştur
    const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-request-id", requestId);

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const path = req.nextUrl.pathname;

    // Rate Limiting
    if (path.startsWith("/api/") && req.method === "POST") {
        const { success } = await ratelimit.limit(`ratelimit_${ip}`);
        if (!success) {
            return NextResponse.json(
                { error: "Too many requests", requestId },
                { status: 429, headers: { "x-request-id": requestId } }
            );
        }
    }
    if (!path.startsWith("/api/") && !path.startsWith("/admin")) {
        // KVKK Uyumlu IP Hashing
        const dataToHash = new TextEncoder().encode(ip + userAgent + new Date().toISOString().split("T")[0]);
        crypto.subtle.digest("SHA-256", dataToHash).then((hashBuffer) => {
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const ipHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);

            // Asenkron olarak Redis'e yaz (Kullanıcıyı bekletmez)
            AnalyticsService.trackVisit(ipHash);
        });
    }
    // RBAC: Yetki Kontrolleri
    const userRole = req.auth?.user?.role;

    if (path.startsWith("/admin/settings") && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    if (path.startsWith("/admin") && !["ADMIN", "MODERATOR"].includes(userRole as string)) {
        if (req.auth) return NextResponse.redirect(new URL("/", req.url));
    }

    // İstekleri downstream'e Request ID ile ilet
    const response = NextResponse.next({
        request: { headers: requestHeaders }
    });

    // Client'a (Tarayıcıya) Request ID'yi dön (Hata anında destek bileti açabilmeleri için)
    response.headers.set("x-request-id", requestId);

    return response;
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};