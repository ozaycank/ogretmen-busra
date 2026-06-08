import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { authConfig } from "@/modules/auth/config/auth.config"; // DİKKAT: Eklendi!

// Edge Runtime için AuthConfig'i mutlaka iletiyoruz ki Session haritalaması yapılsın.
const { auth } = NextAuth(authConfig);

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
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
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

    // -----------------------------
    // RATE LIMIT (API ve POST Login için)
    // -----------------------------
    const isProtectedPost = req.method === "POST" && (pathname.startsWith("/api/") || pathname.startsWith("/admin/login"));
    if (ratelimit && isProtectedPost) {
        const { success } = await ratelimit.limit(`ip:${ip}`);
        if (!success) {
            return NextResponse.json({ error: "Çok fazla istek gönderdiniz. Lütfen biraz bekleyin." }, { status: 429 });
        }
    }

    // -----------------------------
    // AUTH DURUMU (Artık role okunabilecek!)
    // -----------------------------
    const isLoggedIn = !!req.auth?.user;
    const role = req.auth?.user?.role;

    const isLoginPage = pathname === "/admin/login";
    const isAdminRoute = pathname.startsWith("/admin");

    // -----------------------------
    // LOGIN SAYFASI MANTIĞI
    // -----------------------------
    if (isLoginPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        return NextResponse.next();
    }

    // -----------------------------
    // PUBLIC SAYFALAR (Serbest Geçiş)
    // -----------------------------
    if (!isAdminRoute) {
        return NextResponse.next();
    }

    // -----------------------------
    // ADMIN ALANI (KORUMA)
    // -----------------------------
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    if (role !== "ADMIN" && role !== "MODERATOR") {
        return NextResponse.redirect(new URL("/", req.url)); // Yetkisizse anasayfaya!
    }

    if (pathname.startsWith("/admin/materials/settings") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    return NextResponse.next();
});

export const config = {
    // Statik assetleri tamamen devreden çıkararak performansı arttırırız
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};