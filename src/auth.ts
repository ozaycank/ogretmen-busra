import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./modules/auth/config/auth.config";
import { z } from "zod";
import { AuthService } from "./modules/auth/services/auth.service";

class CustomAuthError extends CredentialsSignin {
    constructor(message: string) {
        super(message);
        this.code = "custom_auth_error";
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
    providers: [
        Credentials({
            async authorize(credentials, req) {
                // 🚀 DÜZELTME: turnstileToken'i şemaya ekleyip validate ediyoruz
                const parsed = z
                    .object({
                        email: z.string().email(),
                        password: z.string().min(6),
                        turnstileToken: z.string().optional() // Frontend'den form ile geliyor
                    })
                    .safeParse(credentials);

                if (!parsed.success) return null;

                const { email, password, turnstileToken } = parsed.data;

                let ip = "127.0.0.1";
                if (req && req.headers instanceof Headers) {
                    ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
                }

                // 🚀 DÜZELTME 1: Cloudflare Turnstile Server-Side Validation
                const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
                if (turnstileSecret && turnstileToken) {
                    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: `secret=${turnstileSecret}&response=${turnstileToken}&remoteip=${ip}`,
                    });
                    const verifyOutcome = await verifyRes.json();

                    if (!verifyOutcome.success) {
                        throw new CustomAuthError("Güvenlik doğrulaması başarısız oldu (Bot algılandı).");
                    }
                } else if (turnstileSecret && !turnstileToken) {
                    throw new CustomAuthError("Güvenlik doğrulaması eksik.");
                }

                // 🚀 DÜZELTME 2: İnsan olduğu kanıtlandı, şimdi DB doğrulaması yap
                try {
                    const user = await AuthService.verifyCredentials(email, password, ip);
                    if (!user) return null;
                    return { id: user.id, email: user.email, name: user.name, role: user.role };
                } catch (error: any) {
                    throw new CustomAuthError(error.message);
                }
            },
        }),
    ],
});