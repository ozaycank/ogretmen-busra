"use server";

import { headers } from "next/headers";
import { ContactSchema } from "@/modules/contact/schemas/contact.schema";
import { EmailService } from "@/modules/contact/services/email.service";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/infrastructure/logger";

// State Tipleri (React 19 useActionState uyumlu)
export type ActionState = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
};

// Redis tabanlı Rate Limiter (IP başına 1 saatte en fazla 3 form gönderimi)
const ratelimit = process.env.UPSTASH_REDIS_REST_URL
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(3, "1 h"),
    })
    : null;

export async function submitContactForm(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        // 1. IP ve Rate Limit Kontrolü
        const headerList = await headers();
        const ip = headerList.get("cf-connecting-ip") || headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

        if (ratelimit) {
            const { success } = await ratelimit.limit(`contact_${ip}`);
            if (!success) {
                logger.warn({ ip }, "İletişim formunda Rate Limit aşıldı.");
                return { success: false, message: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." };
            }
        }

        // 2. Form Verilerini Çıkar ve Zod ile Doğrula
        const rawData = {
            name: formData.get("name"),
            email: formData.get("email"),
            subject: formData.get("subject"),
            message: formData.get("message"),
            turnstileToken: formData.get("cf-turnstile-response"), // Cloudflare otomatik inject eder
        };

        const validatedFields = ContactSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return {
                success: false,
                message: "Lütfen formdaki hataları düzeltin.",
                errors: validatedFields.error.flatten().fieldErrors,
            };
        }

        const data = validatedFields.data;

        // 3. Cloudflare Turnstile Doğrulaması (Sunucu Taraflı)
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
        if (turnstileSecret && data.turnstileToken) {
            const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `secret=${turnstileSecret}&response=${data.turnstileToken}&remoteip=${ip}`,
            });
            const verifyOutcome = await verifyRes.json();
            if (!verifyOutcome.success) {
                return { success: false, message: "Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin." };
            }
        }

        // 4. E-postayı Gönder
        await EmailService.sendContactEmail(data);

        logger.info({ ip, email: data.email }, "İletişim formu başarıyla gönderildi.");

        return {
            success: true,
            message: "Mesajınız başarıyla ulaştı! En kısa sürede sizinle iletişime geçeceğiz."
        };

    } catch (error) {
        logger.error({ err: error }, "İletişim formu sunucu hatası");
        return { success: false, message: "Sunucu kaynaklı bir hata oluştu. Lütfen daha sonra tekrar deneyin." };
    }
}