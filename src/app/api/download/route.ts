import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FileStatus } from "@prisma/client";
import { s3Client } from "@/infrastructure/storage/r2";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Geçersiz veya eksik materyal ID'si." }, { status: 400 });
        }

        // 1. Materyali bul ve veritabanında "İndirilme (Download)" sayısını 1 artır
        const material = await prisma.material.update({
            where: { id, status: FileStatus.APPROVED },
            data: { downloadCount: { increment: 1 } }
        });

        if (!material) {
            return NextResponse.json({ error: "Materyal bulunamadı veya onaylanmamış." }, { status: 404 });
        }

        // 2. AWS S3 API üzerinden güvenli ve süreli (15 Dakika) bir indirme linki üret
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: material.fileKey,
            // Tarayıcıya dosyayı açmamasını, doğrudan "Farklı Kaydet" penceresini tetiklemesini söyler.
            ResponseContentDisposition: `attachment; filename="${encodeURIComponent(material.originalName)}"`,
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

        // 3. Kullanıcıyı oluşturulan bu şifreli ve güvenli bağlantıya yönlendir (307)
        return NextResponse.redirect(signedUrl);

    } catch (error) {
        console.error("[DOWNLOAD_ERROR]", error);
        return NextResponse.json({ error: "Dosya indirilirken sunucu tarafında bir hata oluştu." }, { status: 500 });
    }
}