import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string()
        .email("Geçerli bir e-posta adresi girin.")
        .max(255, "E-posta adresi çok uzun.")
        .trim()
        .toLowerCase(),
    password: z.string()
        .min(8, "Şifre en az 8 karakter olmalıdır.")
        .max(100, "Şifre çok uzun."),
    turnstileToken: z.string().min(1, "Lütfen robot olmadığınızı doğrulayın.")
});

export type LoginFormData = z.infer<typeof LoginSchema>;