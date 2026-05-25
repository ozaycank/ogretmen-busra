import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import crypto from "crypto";

// Next.js App Router'da Route Segment Config
export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        // 1. Form Verilerini Çıkarma
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const authorName = formData.get("authorName") as string;
        const grade = formData.get("grade") as string;
        const category = formData.get("category") as string;
        const turnstileToken = formData.get("turnstileToken") as string;
        const file = formData.get("file") as File;

        if (!title || !authorName || !grade || !category || !turnstileToken || !file) {
            return NextResponse.json({ error: "Eksik bilgi gönderildi." }, { status: 400 });
        }

        // 2. Cloudflare Turnstile Bot Doğrulaması
        const verifyEndpoint = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
        const turnstileRes = await fetch(verifyEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`,
        });
        const turnstileData = await turnstileRes.json();

        if (!turnstileData.success) {
            return NextResponse.json({ error: "Bot doğrulaması başarısız oldu." }, { status: 403 });
        }

        // 3. Dosya Validasyonu (Tip ve Boyut)
        const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Desteklenmeyen dosya formatı." }, { status: 400 });
        }

        const maxSize = 10 * 1024 * 1024; // 10 MB sınırı
        if (file.size > maxSize) {
            return NextResponse.json({ error: "Dosya boyutu 10MB'dan büyük olamaz." }, { status: 400 });
        }

        // 4. IP Hashing (Ziyaretçinin IP'sini anonimleştirerek güvenlik için saklama)
        // x-forwarded-for Vercel/Cloudflare gibi proxy'lerin arkasından gerçek IP'yi alır
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

        // 5. Dosyayı Cloudflare R2'ye Yükleme
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        // Çakışmaları önlemek için dosya adına unique bir zaman damgası ekliyoruz
        const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const fileUrl = await uploadToR2(fileBuffer, uniqueFileName, file.type);

        // 6. Prisma ile Veritabanına Kayıt
        // Şema gereği dosya PENDING statüsünde kaydedilecek
        const newMaterial = await prisma.material.create({
            data: {
                title,
                description,
                fileUrl,
                fileType: file.name.split('.').pop() || "unknown", // pdf, docx vs.
                fileSize: file.size,
                authorName,
                grade: grade as any,       // Enum dönüşümü
                category: category as any, // Enum dönüşümü
                ipHash,
                turnstileToken,
            },
        });

        // Başarılı yanıt
        return NextResponse.json({
            success: true,
            message: "Materyal başarıyla yüklendi ve onay sırasına alındı.",
            materialId: newMaterial.id
        }, { status: 201 });

    } catch (error: any) {
        console.error("Materyal Yükleme Hatası:", error);
        // Unique constraint (Aynı Turnstile token'ı tekrar kullanmaya çalışırlarsa) hatası yakalama
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Bu form zaten gönderilmiş." }, { status: 409 });
        }
        return NextResponse.json({ error: "Sunucu tarafında bir hata oluştu." }, { status: 500 });
    }
}