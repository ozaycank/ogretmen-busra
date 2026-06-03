"use server";

import { headers } from "next/headers";
import { LoginSchema } from "@/schemas/auth.schema";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type AuthState = {
    success: boolean;
    message: string;
};

// 1. Güvenli Redis Başlatma (Hata/Eksik env durumunda sistemi çökertmez)
const getRedisClient = () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token || url.includes("your-upstash-url") || url.includes("placeholder")) return null;
    try {
        return new Redis({ url, token });
    } catch (e) {
        return null;
    }
};

const redisClient = getRedisClient();
const ratelimit = redisClient
    ? new Ratelimit({ redis: redisClient, limiter: Ratelimit.slidingWindow(5, "1 m") })
    : null;

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

    try {
        // 2. IP Rate Limiting (Sadece Redis Aktifse Çalışır)
        if (ratelimit) {
            const { success } = await ratelimit.limit(`login_ip_${ip}`);
            if (!success) {
                logger.warn({ ip }, "IP tabanlı giriş limiti aşıldı.");
                return { success: false, message: "Çok fazla başarısız deneme. Lütfen 1 dakika bekleyin." };
            }
        }

        // 3. Girdi Doğrulama (Zod)
        const rawData = {
            email: formData.get("email"),
            password: formData.get("password"),
            turnstileToken: formData.get("cf-turnstile-response"),
        };

        const validated = LoginSchema.safeParse(rawData);
        if (!validated.success) {
            return { success: false, message: "Lütfen e-posta ve şifrenizi kontrol edin." };
        }
        const { email, password, turnstileToken } = validated.data;

        // 4. Cloudflare Turnstile Bot Doğrulaması
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
        if (turnstileSecret && turnstileToken && !turnstileSecret.includes("0000000000")) {
            const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `secret=${turnstileSecret}&response=${turnstileToken}&remoteip=${ip}`,
            });
            const verifyOutcome = await verifyRes.json();
            if (!verifyOutcome.success) {
                return { success: false, message: "Güvenlik doğrulaması başarısız oldu (Bot Koruması)." };
            }
        }

        // 5. Merkezi NextAuth Giriş İşlemi
        // Bu fonksiyon, senin yazdığın auth.service.ts'deki verifyCredentials'ı otomatik tetikler.
        await signIn("credentials", {
            email,
            password,
            redirect: false, // Hata yakalamak için otomatik yönlendirmeyi kapatıyoruz
        });

        return { success: true, message: "Giriş başarılı, yönlendiriliyorsunuz..." };

    } catch (error) {
        if (error instanceof AuthError) {
            // auth.service.ts'den fırlatılan özel hata mesajlarını (Hesap kilitlendi vb.) UI'a aktarır
            const errorMessage = error.cause?.err?.message || "Geçersiz e-posta veya şifre.";
            return { success: false, message: errorMessage };
        }

        logger.error({ err: error }, "Giriş işlemi sırasında sunucu hatası");
        return { success: false, message: "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin." };
    }
}