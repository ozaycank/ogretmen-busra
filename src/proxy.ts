import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

import { authConfig } from "@/modules/auth/config/auth.config";

const { auth } = NextAuth(authConfig);

const redis =
    process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
        : null;

const ratelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        analytics: true,
    })
    : null;

export default auth(async (req) => {
    const pathname = req.nextUrl.pathname;

    const ip =
        req.headers.get("cf-connecting-ip") ||
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "127.0.0.1";

    // --------------------------------------------------
    // RATE LIMIT
    // --------------------------------------------------

    const isLoginAttempt =
        req.method === "POST" &&
        pathname === "/api/auth/callback/credentials";

    const isProtectedApiPost =
        req.method === "POST" &&
        pathname.startsWith("/api/") &&
        !pathname.startsWith("/api/auth");

    if (ratelimit && (isLoginAttempt || isProtectedApiPost)) {
        const { success } = await ratelimit.limit(`ip:${ip}`);

        if (!success) {
            return NextResponse.json(
                {
                    error:
                        "Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.",
                },
                {
                    status: 429,
                },
            );
        }
    }

    // --------------------------------------------------
    // ADMIN YETKİ KONTROLÜ
    // --------------------------------------------------

    const isLoggedIn = !!req.auth?.user;
    const role = req.auth?.user?.role;

    const isLoginPage = pathname === "/admin/login";
    const isAdminRoute = pathname.startsWith("/admin");

    if (isLoginPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(
                new URL("/admin/dashboard", req.url),
            );
        }

        return NextResponse.next();
    }

    // API route'ları burada auth yönlendirmesi almadan devam eder.
    // POST rate limit yukarıda uygulanmıştır.
    if (!isAdminRoute) {
        return NextResponse.next();
    }

    if (!isLoggedIn) {
        return NextResponse.redirect(
            new URL("/admin/login", req.url),
        );
    }

    if (role !== "ADMIN" && role !== "MODERATOR") {
        return NextResponse.redirect(
            new URL("/", req.url),
        );
    }

    if (
        pathname.startsWith("/admin/materials/settings") &&
        role !== "ADMIN"
    ) {
        return NextResponse.redirect(
            new URL("/admin/dashboard", req.url),
        );
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/:path*",
    ],
};