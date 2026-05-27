import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Materyal ID gereklidir." }, { status: 400 });
    }

    try {
        const material = await prisma.material.findUnique({
            where: { id }
        });

        if (!material || !material.fileUrl) {
            return NextResponse.json({ error: "Materyal veya dosya bulunamadı." }, { status: 404 });
        }

        // İndirme sayısını artır (Asenkron)
        await prisma.material.update({
            where: { id },
            data: { downloadCount: { increment: 1 } }
        });

        // Kullanıcıyı R2/Cloudflare üzerindeki gerçek dosyaya yönlendir
        return NextResponse.redirect(material.fileUrl);

    } catch (error) {
        logger.error({ err: error, materialId: id }, "İndirme işlemi sırasında hata oluştu.");
        return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
    }
}