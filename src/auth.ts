import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import bcrypt from "bcryptjs";
// import { prisma } from "@/lib/prisma"; // Gerçek DB bağlantısı

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    /* GERÇEK VERİTABANI KONTROLÜ
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) return null;
                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                    */

                    // Hardcoded Admin (Sadece MVP aşaması için)
                    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                        return { id: "1", name: "Büşra Öğretmen", email, role: "ADMIN" };
                    }
                }
                return null;
            },
        }),
    ],
});