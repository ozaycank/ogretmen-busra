import { NextResponse } from "next/server";

import { AnalyticsService } from "@/modules/analytics/services/analytics.service";

/*
 * Request-specific hiçbir veri kullanmıyoruz.
 * Bu endpoint statik/ISR response olarak tutulabilir.
 */
export const dynamic =
    "force-static";

export const revalidate = 60;

export async function GET() {
    const stats =
        await AnalyticsService.getGlobalStats();

    return NextResponse.json(
        stats,
    );
}