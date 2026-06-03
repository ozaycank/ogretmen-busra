import { NextResponse } from "next/server";
import { AnalyticsService } from "@/services/analytics.service";
import { logger } from "@/lib/logger";

// Sadece yetkili cron servislerinin tetikleyebilmesi için güvenlik
export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const result = await AnalyticsService.syncDailyStats();
        logger.info(result, "Günlük istatistik senkronizasyonu tamamlandı.");
        return NextResponse.json(result);
    } catch (error) {
        logger.error({ err: error }, "İstatistik senkronizasyonu başarısız.");
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}