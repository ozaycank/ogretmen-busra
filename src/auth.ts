import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./config/auth.config";
import { z } from "zod";
import { AuthService } from "./services/auth.services";

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt", maxAge: 24 * 60 * 60 }, // 1 gün
    providers: [
        Credentials({
            async authorize(credentials, req) {
                const parsed = z
                    .object({ email: z.string().email(), password: z.string().min(8) })
                    .safeParse(credentials);

                if (!parsed.success) return null;

                const ip = req.headers?.get("x-forwarded-for") || "unknown";

                try {
                    const user = await AuthService.verifyCredentials(
                        parsed.data.email,
                        parsed.data.password,
                        ip
                    );

                    if (!user) return null;
                    return { id: user.id, email: user.email, name: user.name, role: user.role };
                } catch (error: any) {
                    // Güvenlik: Spesifik hata mesajını UI'a yansıt (örn: Kilitli hesap)
                    throw new Error(error.message);
                }
            },
        }),
    ],
});