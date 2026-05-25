import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");

            // Admin sayfalarına sadece giriş yapmış kullanıcılar erişebilir
            if (isOnAdmin) {
                if (isLoggedIn) return true;
                return false; // Giriş sayfasına yönlendir (Redirect)
            }
            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    providers: [], // provider'lar auth.ts'de eklenecek (Bcrypt çakışmasını önlemek için)
} satisfies NextAuthConfig;