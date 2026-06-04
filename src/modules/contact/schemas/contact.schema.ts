import { z } from "zod";

// Basit XSS koruması için HTML etiketlerini temizleyen yardımcı fonksiyon
const sanitizeInput = (val: string) => val.replace(/<[^>]*>?/gm, "").trim();

export const ContactSchema = z.object({
    name: z.string()
        .min(3, "Adınız en az 3 karakter olmalıdır.")
        .max(100, "Adınız çok uzun.")
        .transform(sanitizeInput),
    email: z.string()
        .email("Lütfen geçerli bir e-posta adresi girin.")
        .transform(sanitizeInput),
    subject: z.string()
        .min(5, "Konu en az 5 karakter olmalıdır.")
        .max(150, "Konu çok uzun.")
        .transform(sanitizeInput),
    message: z.string()
        .min(20, "Mesajınız en az 20 karakter olmalıdır, lütfen biraz daha detaylandırın.")
        .max(2000, "Mesajınız 2000 karakteri aşamaz.")
        .transform(sanitizeInput),
    turnstileToken: z.string().min(1, "Lütfen robot olmadığınızı doğrulayın."),
});

export type ContactFormData = z.infer<typeof ContactSchema>;