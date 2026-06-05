"use server";

import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/infrastructure/logger";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";

export type AuthState = { success: boolean; message: string; };

const getRedisClient = () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token || url.includes("your-upstash-url") || url.includes("placeholder")) return null;
    try { return new Redis({ url, token }); } catch (e) { return null; }
};

const ratelimit = getRedisClient() ? new Ratelimit({ redis: getRedisClient()!, limiter: Ratelimit.slidingWindow(5, "1 m") }) : null;

// Lokal geliştirme ortamında Turnstile token'ın boş gelmesini tolere eden güvenli Zod Şeması
const loginSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi girin."),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
    turnstileToken: z.string().optional().nullable(),
});

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

    try {
        if (ratelimit) {
            const { success } = await ratelimit.limit(`login_ip_${ip}`);
            if (!success) {
                return { success: false, message: "Çok fazla başarısız deneme. Lütfen 1 dakika bekleyin." };
            }
        }

        const rawData = {
            email: formData.get("email"),
            password: formData.get("password"),
            turnstileToken: formData.get("cf-turnstile-response"),
        };

        const validated = loginSchema.safeParse(rawData);
        if (!validated.success) {
            return { success: false, message: validated.error.issues[0].message };
        }

        const { email, password, turnstileToken } = validated.data;

        // Turnstile (Sadece prod ortamında veya secret key varsa çalışır)
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
        if (turnstileSecret && turnstileToken && !turnstileSecret.includes("0000000000")) {
            const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `secret=${turnstileSecret}&response=${turnstileToken}&remoteip=${ip}`,
            });
            const verifyOutcome = await verifyRes.json();
            if (!verifyOutcome.success) {
                return { success: false, message: "Bot doğrulaması başarısız oldu." };
            }
        }

        // Merkezi NextAuth Girişi
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/admin/dashboard", // Başarılıysa NextAuth yönlendirmeyi yapar
        });

        return { success: true, message: "Giriş başarılı, yönlendiriliyorsunuz..." };

    } catch (error) {
        // 1. Hata NextAuth'dan geliyorsa (Yanlış şifre vs.)
        if (error instanceof AuthError) {
            const errorMessage = error.cause?.err?.message || "E-posta veya şifre hatalı.";
            return { success: false, message: errorMessage };
        }
        // 2. EĞER HATA BİR YÖNLENDİRME (REDIRECT) İSE KESİNLİKLE MÜDAHALE ETME!
        // Next.js'in yönlendirme hatası fırlattığını mesajın içeriğinden anlıyoruz.
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            throw error;
        }
        // 3. Gerçek bir sistem hatasıysa (Veritabanı çökmesi vb.)
        logger.error({ err: error }, "Giriş işlemi sırasında sunucu hatası");
        return { success: false, message: "Sistem hatası oluştu. Lütfen daha sonra tekrar deneyin." };
    }
}