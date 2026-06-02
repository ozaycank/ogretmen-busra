"use server";

import { cookies, headers } from "next/headers";
import { LoginSchema } from "@/schemas/auth.schema";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { AuditAction } from "@prisma/client";
import { logger } from "@/lib/logger";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// IP bazlı Brute-Force koruması (Dakikada maks 5 deneme)
const ratelimit = process.env.UPSTASH_REDIS_REST_URL
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, "1 m"),
    })
    : null;

export type AuthState = {
    success: boolean;
    message: string;
};

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = headerList.get("user-agent") || "unknown";

    try {
        // 1. IP Rate Limiting
        if (ratelimit) {
            const { success } = await ratelimit.limit(`login_ip_${ip}`);
            if (!success) {
                logger.warn({ ip }, "IP tabanlı giriş limiti aşıldı.");
                return { success: false, message: "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin." };
            }
        }

        // 2. Girdi Doğrulama
        const rawData = {
            email: formData.get("email"),
            password: formData.get("password"),
            turnstileToken: formData.get("cf-turnstile-response"),
        };

        const validated = LoginSchema.safeParse(rawData);
        if (!validated.success) {
            return { success: false, message: "Lütfen bilgilerinizi kontrol edin." };
        }
        const { email, password, turnstileToken } = validated.data;

        // 3. Turnstile Bot Doğrulaması
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
        if (turnstileSecret && turnstileToken) {
            const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `secret=${turnstileSecret}&response=${turnstileToken}&remoteip=${ip}`,
            });
            const verifyOutcome = await verifyRes.json();
            if (!verifyOutcome.success) {
                return { success: false, message: "Güvenlik doğrulaması başarısız oldu." };
            }
        }

        // 4. Veritabanı Sorgusu
        const user = await prisma.user.findUnique({ where: { email } });

        // TİMING ATTACK KORUMASI: Kullanıcı yoksa bile bcrypt hash'leme süresini simüle et
        if (!user) {
            await bcrypt.hash(password, 12);
            await prisma.auditLog.create({
                data: { action: AuditAction.LOGIN_FAILED, ipAddress: ip, userAgent, details: `Olmayan e-posta: ${email}` }
            });
            return { success: false, message: "Geçersiz e-posta veya şifre." }; // Bilgi sızdırmayan genel hata
        }

        // 5. Hesap Kilidi Kontrolü (Account Lockout)
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            return { success: false, message: "Hesabınız güvenlik nedeniyle geçici olarak kilitlendi. Lütfen daha sonra deneyin." };
        }

        // 6. Şifre Doğrulama
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            const attempts = user.failedLoginAttempts + 1;
            let lockedUntil = null;
            let action: AuditAction = AuditAction.LOGIN_FAILED;
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000);
                action = AuditAction.ACCOUNT_LOCKED;
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { failedLoginAttempts: attempts, lockedUntil }
            });

            await prisma.auditLog.create({
                data: { userId: user.id, action, ipAddress: ip, userAgent }
            });

            return { success: false, message: "Geçersiz e-posta veya şifre." };
        }

        // 7. Başarılı Giriş & Temizlik
        await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null }
        });

        await prisma.auditLog.create({
            data: { userId: user.id, action: AuditAction.LOGIN_SUCCESS, ipAddress: ip, userAgent }
        });

        // 8. JWT ve Güvenli Çerez (Session Hardening)
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secure_super_secret_key_change_me");
        const jwt = await new SignJWT({ sub: user.id, role: user.role, email: user.email, name: user.name })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('8h') // 8 Saatlik oturum
            .sign(secret);

        const cookieStore = await cookies();
        cookieStore.set("admin_session", jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 8 * 60 * 60,
            path: "/",
        });

        return { success: true, message: "Giriş başarılı, yönlendiriliyorsunuz..." };

    } catch (error) {
        logger.error({ err: error }, "Giriş işlemi sırasında sunucu hatası");
        return { success: false, message: "Sistem hatası oluştu. Lütfen daha sonra tekrar deneyin." };
    }
}