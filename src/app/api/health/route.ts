import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { logger } from "@/infrastructure/logger";

export async function GET() {
    try {
        const start = performance.now();

        // Veritabanı bağlantı testi
        await prisma.$queryRaw`SELECT 1`;

        const dbLatency = Math.round(performance.now() - start);

        return NextResponse.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            database: "connected",
            dbLatencyMs: dbLatency,
            version: process.env.npm_package_version || "0.1.0"
        }, { status: 200 });

    } catch (error: any) {
        logger.error({ err: error }, "Health check failed: Database connection error");

        return NextResponse.json({
            status: "error",
            timestamp: new Date().toISOString(),
            database: "disconnected",
            message: "Service unavailable"
        }, { status: 503 });
    }
}