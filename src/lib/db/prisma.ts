import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClientSingleton = () => {
    // 1. PostgreSQL bağlantı havuzunu (Pool) başlat
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // 2. Prisma PostgreSQL Adaptörünü oluştur
    const adapter = new PrismaPg(pool);

    // 3. Adaptörü Prisma Client'a bağla
    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}