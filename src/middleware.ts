import NextAuth from "next-auth";
import { authConfig } from "./config/auth.config";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const { auth } = NextAuth(authConfig);
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "10 s"),
    analytics: true,
});

export default auth(async (req) => {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const path = req.nextUrl.pathname;

    // Rate Limiting
    if (path.startsWith("/api/") && req.method === "POST") {
        const { success } = await ratelimit.limit(`ratelimit_${ip}`);
        if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // RBAC: Yetki Kontrolleri
    const userRole = req.auth?.user?.role;

    if (path.startsWith("/admin/settings") && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    if (path.startsWith("/admin") && !["ADMIN", "MODERATOR"].includes(userRole as string)) {
        if (req.auth) return NextResponse.redirect(new URL("/", req.url)); // Yetkisizse ana sayfaya
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};