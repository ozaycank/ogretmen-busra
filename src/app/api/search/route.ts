import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

// 1. Zod Validation Schema
const searchSchema = z.object({
    q: z.string().min(2, "Search term must be at least 2 characters").max(100, "Search term is too long"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10), // Prevent excessive data fetching
});

// 2. Safe Redis Initialization (Graceful Degradation)
const getRedisClient = () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token || url.includes("your-upstash-url") || url.includes("placeholder")) return null;
    try { return new Redis({ url, token }); } catch { return null; }
};

const ratelimit = getRedisClient()
    ? new Ratelimit({ redis: getRedisClient()!, limiter: Ratelimit.slidingWindow(20, "10 s") })
    : null;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;

        // 3. Rate Limiting Check
        if (ratelimit) {
            const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
            const { success } = await ratelimit.limit(`search_api_${ip}`);
            if (!success) {
                return NextResponse.json({ error: "Too many requests" }, { status: 429 });
            }
        }

        // 4. Validate & Sanitize Input
        const queryData = {
            q: searchParams.get("q"),
            page: searchParams.get("page"),
            limit: searchParams.get("limit")
        };

        const validated = searchSchema.safeParse(queryData);
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const { q: searchTerm, page, limit } = validated.data;
        const skip = (page - 1) * limit;

        // 5. Optimized Prisma Query (Targeting News only as per requirements)
        const [results, totalCount] = await Promise.all([
            prisma.news.findMany({
                where: {
                    status: "PUBLISHED", // Security: Only show published content
                    OR: [
                        { title: { contains: searchTerm, mode: "insensitive" } },
                        { content: { contains: searchTerm, mode: "insensitive" } },
                        { label: { contains: searchTerm, mode: "insensitive" } }
                    ]
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    label: true,
                    createdAt: true,
                    // Explicitly NOT selecting 'content' or other heavy/sensitive fields
                },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: skip,
            }),
            prisma.news.count({
                where: {
                    status: "PUBLISHED",
                    OR: [
                        { title: { contains: searchTerm, mode: "insensitive" } },
                        { content: { contains: searchTerm, mode: "insensitive" } },
                        { label: { contains: searchTerm, mode: "insensitive" } }
                    ]
                }
            })
        ]);

        // 6. Map to standardized response format
        const formattedResults = results.map(item => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            type: "news",
            createdAt: item.createdAt,
            category: item.label // Optional category mapped
        }));

        return NextResponse.json({
            data: formattedResults,
            meta: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error("[SEARCH_API_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}