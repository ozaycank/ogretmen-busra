"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/infrastructure/database/prisma";
import { NewsSchema, NewsFormData } from "@/modules/news/schemas/news.schema";
import { auth } from "@/auth";

async function verifyAdmin() {
    const session = await auth();
    // Haber eklemeyi sadece Admin ve Moderatör yapabilir
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
        throw new Error("Yetkisiz işlem");
    }
    return session.user;
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
    try {
        await verifyAdmin();
        await prisma.news.delete({ where: { id } });
        revalidatePath("/admin/news");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Silme işlemi başarısız." };
    }
}