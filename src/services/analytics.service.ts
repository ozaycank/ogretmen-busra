import { Redis } from "@upstash/redis";
import { prisma } from "@/lib/db/prisma";

const redis = Redis.fromEnv();

export class AnalyticsService {
    /**
     * Ziyaretçiyi Redis'e kaydeder (Middleware üzerinden çağrılır)
     */
    static async trackVisit(ipHash: string) {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const now = Date.now();

        const pipeline = redis.pipeline();

        // 1. Çevrimiçi Ziyaretçi (Son 5 dakika) - Sorted Set
        pipeline.zadd("site:online", { score: now, member: ipHash });

        // 2. Bugünün Benzersiz Ziyaretçisi - HyperLogLog
        pipeline.pfadd(`site:daily:${today}`, ipHash);

        // 3. 5 dakikadan eski online kayıtlarını temizle
        pipeline.zremrangebyscore("site:online", 0, now - 5 * 60 * 1000);

        // Ana akışı bloklamamak için fire-and-forget yapıyoruz (await yok)
        pipeline.exec().catch((err) => console.error("Redis tracking error:", err));
    }

    /**
     * Footer için istatistikleri getirir
     */
    static async getGlobalStats() {
        const today = new Date().toISOString().split("T")[0];
        const now = Date.now();

        try {
            // Redis'ten canlı verileri çek
            const [onlineUsers, todayVisitors] = await Promise.all([
                redis.zcount("site:online", now - 5 * 60 * 1000, now),
                redis.pfcount(`site:daily:${today}`)
            ]);

            // DB'den geçmiş verileri çek (En son güncellenen satırı al)
            const dbStats = await prisma.siteStats.findFirst({
                orderBy: { date: "desc" }
            });

            return {
                online: onlineUsers || 1, // En azından kendini görsün
                today: todayVisitors || 1,
                yesterday: dbStats?.yesterday || 0,
                total: (dbStats?.total || 0) + (todayVisitors || 0) // Geçmiş toplam + bugünkü canlı
            };
        } catch (error) {
            console.error("Stats fetch error:", error);
            // Fallback (Çökme durumunda sahte veri dön ki site ayakta kalsın)
            return { online: 1, today: 1, yesterday: 0, total: 0 };
        }
    }

    /**
     * Cron Job için: Gece yarısı Redis'i DB'ye eşitler
     */
    static async syncDailyStats() {
        // Dünün tarihini bul (Çünkü bu cron 00:01'de çalışacak)
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

        const yesterdayVisitors = await redis.pfcount(`site:daily:${yesterdayStr}`);

        // DB'deki son toplamı bul
        const lastStat = await prisma.siteStats.findFirst({ orderBy: { date: "desc" } });
        const newTotal = (lastStat?.total || 0) + yesterdayVisitors;

        // Yeni günü DB'ye kaydet
        await prisma.siteStats.create({
            data: {
                date: new Date(), // Bugünkü tarih
                online: 0,
                today: 0,
                yesterday: yesterdayVisitors,
                total: newTotal
            }
        });

        // Redis'teki dünün HyperLogLog verisini silerek yer aç
        await redis.del(`site:daily:${yesterdayStr}`);

        return { success: true, yesterdayVisitors, newTotal };
    }
}