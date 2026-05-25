import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Veritabanı bağlantı havuzunu (Pool) yerel sürücü ile oluşturuyoruz
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Prisma için adaptörü tanımlıyoruz
const adapter = new PrismaPg(pool);

// Global objeye PrismaClient'ı ekliyoruz (Sadece development ortamı için)
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Prisma 7 standardı: Client'ı başlatırken adaptörü içeri aktarıyoruz
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;