import { Redis } from "@upstash/redis";
import { prisma } from "@/infrastructure/database/prisma";

// Enterprise-Grade Graceful Redis Initialization
const getRedisClient = () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token || url.includes("your-upstash-url") || url.includes("placeholder")) {
        console.warn("⚠️ [Analytics] Redis credentials missing or invalid. Analytics running in degraded mode.");
        return null;
    }

    try {
        return new Redis({ url, token });
    } catch (e) {
        console.error("⚠️ [Analytics] Failed to initialize Redis:", e);
        return null;
    }
};

const redis = getRedisClient();

export class AnalyticsService {
    /**
     * Ziyaretçiyi Redis'e kaydeder (Middleware üzerinden çağrılır)
     */
    static async trackVisit(ipHash: string) {
        if (!redis) return; // Fail-safe: Redis yoksa sessizce çık

        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const now = Date.now();

        try {
            const pipeline = redis.pipeline();

            // 1. Çevrimiçi Ziyaretçi (Son 5 dakika) - Sorted Set
            pipeline.zadd("site:online", { score: now, member: ipHash });

            // 2. Bugünün Benzersiz Ziyaretçisi - HyperLogLog
            pipeline.pfadd(`site:daily:${today}`, ipHash);

            // 3. 5 dakikadan eski online kayıtlarını temizle
            pipeline.zremrangebyscore("site:online", 0, now - 5 * 60 * 1000);

            // Fire and forget
            await pipeline.exec();
        } catch (error) {
            console.error("Redis tracking error:", error);
        }
    }

    /**
     * Footer için istatistikleri getirir
     */
    static async getGlobalStats() {
        const today = new Date().toISOString().split("T")[0];
        const now = Date.now();

        try {
            // Redis aktifse canlı verileri çek
            let onlineUsers = 1;
            let todayVisitors = 1;

            if (redis) {
                const [online, todayVisits] = await Promise.all([
                    redis.zcount("site:online", now - 5 * 60 * 1000, now),
                    redis.pfcount(`site:daily:${today}`)
                ]);
                onlineUsers = online || 1;
                todayVisitors = todayVisits || 1;
            }

            // DB'den geçmiş verileri çek
            const dbStats = await prisma.siteStats.findFirst({
                orderBy: { date: "desc" }
            });

            return {
                online: onlineUsers,
                today: todayVisitors,
                yesterday: dbStats?.yesterday || 0,
                total: (dbStats?.total || 0) + todayVisitors
            };
        } catch (error) {
            console.error("Stats fetch error:", error);
            return { online: 1, today: 1, yesterday: 0, total: 0 };
        }
    }

    /**
     * Cron Job için: Gece yarısı Redis'i DB'ye eşitler
     */
    static async syncDailyStats() {
        if (!redis) return { success: false, reason: "Redis is not configured." };

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

        const yesterdayVisitors = await redis.pfcount(`site:daily:${yesterdayStr}`);

        const lastStat = await prisma.siteStats.findFirst({ orderBy: { date: "desc" } });
        const newTotal = (lastStat?.total || 0) + yesterdayVisitors;

        await prisma.siteStats.create({
            data: {
                date: new Date(),
                online: 0,
                today: 0,
                yesterday: yesterdayVisitors,
                total: newTotal
            }
        });

        await redis.del(`site:daily:${yesterdayStr}`);

        return { success: true, yesterdayVisitors, newTotal };
    }
}