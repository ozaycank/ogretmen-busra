"use server";

import { prisma } from "@/infrastructure/database/prisma";
import { FileStatus } from "@prisma/client";

export async function getFavoriteMaterials(ids: string[]) {
    if (!ids || ids.length === 0) return [];

    try {
        const materials = await prisma.material.findMany({
            where: {
                id: { in: ids },
                status: FileStatus.APPROVED // Güvenlik: Kullanıcı silinmiş veya reddedilmiş bir ID'yi manipüle edip çağıramaz
            },
            orderBy: { createdAt: "desc" } // En yeniler üstte
        });

        return materials;
    } catch (error) {
        console.error("Favoriler çekilirken hata:", error);
        return [];
    }
}