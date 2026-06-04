"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/database/prisma";
import { NewsSchema, NewsFormData } from "@/modules/news/schemas/news.schema";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

async function verifyAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) throw new Error("Yetkisiz");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secure_super_secret_key_change_me");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== Role.ADMIN && payload.role !== Role.MODERATOR) throw new Error("Yetkisiz");
    return payload;
}

export async function saveNews(id: string | null, data: NewsFormData) {
    try {
        await verifyAdmin();
        const validated = NewsSchema.parse(data);

        const payload = {
            ...validated,
            publishedAt: validated.status === "PUBLISHED" ? new Date() : null,
        };

        let newsId = id;

        if (id) {
            await prisma.news.update({ where: { id }, data: payload });
        } else {
            const created = await prisma.news.create({ data: payload });
            newsId = created.id;
        }

        revalidatePath("/admin/news");
        revalidatePath("/haberler");

        return { success: true, id: newsId };
    } catch (error: any) {
        return { success: false, error: error.message || "Kaydetme başarısız." };
    }
}

export async function deleteNews(id: string) {
    await verifyAdmin();
    await prisma.news.delete({ where: { id } });
    revalidatePath("/admin/news");
    return { success: true };
}