import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client"; // Tip dönüşümü için Prisma'dan Role enum'ını ekledik

export const authConfig = {
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");

            if (isOnAdmin) return isLoggedIn;
            return true;
        },
        jwt({ token, user }) {
            // User nesnesi sadece ilk girişte (login) gelir
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                // 'unknown' tipinden beklenen tiplere açıkça (explicit) cast ediyoruz
                session.user.id = token.id as string;
                session.user.role = token.role as Role;
            }
            return session;
        },
    },
    providers: [],
} satisfies NextAuthConfig;