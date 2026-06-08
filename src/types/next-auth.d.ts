import { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client"; // SADECE TİP İMPORTU (Edge için güvenli)

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: Role; // Tekrar Role tipine döndürdük
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: Role;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: Role;
    }
}