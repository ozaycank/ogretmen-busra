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
                const parsed = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (!parsed.success) return null;

                let ip = "127.0.0.1";
                if (req && req.headers instanceof Headers) {
                    ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
                }

                try {
                    const user = await AuthService.verifyCredentials(
                        parsed.data.email,
                        parsed.data.password,
                        ip
                    );

                    if (!user) return null;
                    return { id: user.id, email: user.email, name: user.name, role: user.role };
                } catch (error: any) {
                    throw new CustomAuthError(error.message);
                }
            },
        }),
    ],
});