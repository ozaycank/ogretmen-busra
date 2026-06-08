import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const { auth } = NextAuth({
    providers: [],
    secret: process.env.AUTH_SECRET,
});

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
        req.headers
            .get("x-forwarded-for")
            ?.split(",")[0]
            ?.trim() ?? "127.0.0.1";

    // -----------------------------
    // RATE LIMIT
    // -----------------------------

    const isProtectedPost =
        req.method === "POST" &&
        (pathname.startsWith("/api/") ||
            pathname.startsWith("/admin/login"));

    if (ratelimit && isProtectedPost) {
        const { success } = await ratelimit.limit(`ip:${ip}`);

        if (!success) {
            return NextResponse.json(
                {
                    error:
                        "Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.",
                },
                {
                    status: 429,
                }
            );
        }
    }

    // -----------------------------
    // ADMIN LOGIN SAYFASI
    // -----------------------------

    const isLoginPage = pathname === "/admin/login";

    if (isLoginPage) {
        if (req.auth?.user) {
            return NextResponse.redirect(
                new URL("/admin/dashboard", req.url)
            );
        }

        return NextResponse.next();
    }

    // -----------------------------
    // ADMIN ALANI DEĞİLSE GEÇ
    // -----------------------------

    if (!pathname.startsWith("/admin")) {
        return NextResponse.next();
    }

    // -----------------------------
    // OTURUM YOKSA LOGIN'E GÖNDER
    // -----------------------------

    if (!req.auth?.user) {
        return NextResponse.redirect(
            new URL("/admin/login", req.url)
        );
    }

    // -----------------------------
    // ROLE CHECK
    // -----------------------------

    const role = req.auth.user.role;

    if (role !== "ADMIN" && role !== "MODERATOR") {
        return NextResponse.redirect(
            new URL("/", req.url)
        );
    }

    // -----------------------------
    // SADECE ADMIN SAYFALARI
    // -----------------------------

    if (
        pathname.startsWith("/admin/materials/settings") &&
        role !== "ADMIN"
    ) {
        return NextResponse.redirect(
            new URL("/admin/dashboard", req.url)
        );
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
    ],
};