import "dotenv/config";
import { Role, FileStatus, GradeLevel, ContentCategory, PostStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/infrastructure/database/prisma";
import crypto from "crypto";
import { slugify, MAX_SLUG_LENGTH } from "../src/shared/utils/slugify";

async function main() {
    console.log("🌱 Veritabanı seed işlemi başlatılıyor...");

    // 1. Admin Kullanıcısı Oluşturma
    console.log("Kullanıcılar kontrol ediliyor...");
    const hash = await bcrypt.hash("GuvenliSifre123!", 12);
    await prisma.user.upsert({
        where: { email: "admin@ogretmenbusra.com" },
        update: {},
        create: {
            email: "admin@ogretmenbusra.com",
            name: "Sistem Yöneticisi",
            passwordHash: hash,
            role: Role.ADMIN,
        },
    });
    console.log("✅ Admin kullanıcısı hazır!");

    // 2. Sahte Eğitim Materyalleri (Mock Data)
    console.log("Mock eğitim materyalleri ekleniyor...");
    const mockMaterials = [
        {
            title: "1. Sınıf İlk Okuma Yazma - E Sesi Fasikülü",
            description: "Öğrencilerin E sesini kolayca kavraması için hazırlanmış boyamalı, tekerlemeli ve eğlenceli 10 sayfalık etkinlik kağıtları.",
            authorName: "Büşra Öğretmen",
            grade: GradeLevel.SINIF_1,
            category: ContentCategory.ETKINLIK,
            mimeType: "application/pdf",
            fileType: "pdf",
        },
        {
            title: "4. Sınıf Fen Bilimleri Yer Kabuğu Yapbozu",
            description: "Yer kabuğunun yapısını ve katmanlarını anlatan, öğrencilerin kesip defterlerine yapıştırabileceği interaktif etkinlik sayfası.",
            authorName: "Ali Veli",
            grade: GradeLevel.SINIF_4,
            category: ContentCategory.INTERAKTIF_OYUN,
            mimeType: "application/pdf",
            fileType: "pdf",
        }
    ];

    for (const material of mockMaterials) {
        const uuid = crypto.randomUUID();
        // ZORUNLU EKLENTİ: Seed verisi için slug üretimi (Çakışmaları önlemek adına UUID prefix eklendi)
        const baseSlug = slugify(material.title).substring(0, MAX_SLUG_LENGTH - 7);
        const finalSlug = `${baseSlug}-${uuid.substring(0, 6)}`;

        await prisma.material.create({
            data: {
                slug: finalSlug, // EKLENDİ (TypeScript hatasını çözer)
                title: material.title,
                description: material.description,
                authorName: material.authorName,
                grade: material.grade,
                category: material.category,
                fileType: material.fileType,
                mimeType: material.mimeType,
                fileSize: 1024000,
                fileKey: `mock/${uuid}.${material.fileType}`,
                originalName: `mock_${uuid.substring(0, 5)}.${material.fileType}`,
                fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                status: FileStatus.APPROVED,
                viewCount: 150,
                downloadCount: 40,
                ipHash: "seed_script",
                turnstileToken: crypto.randomUUID(),
            }
        });
    }
    console.log("✅ Materyaller eklendi!");

    // 3. Test Haberleri Ekleme (News)
    console.log("Mock haberler ekleniyor...");
    const mockNews = [
        {
            title: "2026 Yılı Öğretmen Atama Takvimi ve Kontenjanlar Açıklandı",
            slug: "2026-yili-ogretmen-atama-takvimi",
            status: PostStatus.PUBLISHED, // Enum'a çevrildi
            content: "Milli Eğitim Bakanlığı (MEB) tarafından yapılan son açıklamaya göre, 2026 yılı için beklenen öğretmen atama takvimi netleşti. Bakanlık, ilk etapta 40 bin yeni öğretmen ataması yapılacağını duyurdu.\n\nSınıf öğretmenliği, özel eğitim ve okul öncesi branşlarına ağırlık verileceği belirtilirken, başvuruların önümüzdeki ay MEBBİS üzerinden alınacağı bildirildi. Adaylar mülakat tarihlerine e-Devlet üzerinden erişebilecekler.\n\nYetkililer sürecin şeffaf ilerleyeceğini ve güvenlik soruşturmalarının atama öncesi tamamlanacağını vurguladı.",
            imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1000&auto=format&fit=crop",
            label: "ATAMA",
            viewCount: 1250,
        },
        {
            title: "İlkokullarda Beceri Temelli Yeni Müfredat Uygulamasına Geçiliyor",
            slug: "ilkokullarda-beceri-temelli-yeni-mufredat",
            status: PostStatus.PUBLISHED, // Enum'a çevrildi
            content: "Eğitimde köklü bir değişikliğe gidiliyor. Gelecek eğitim-öğretim yılından itibaren ilkokul seviyesinde 'Beceri Temelli Eğitim' modeline geçileceği açıklandı.\n\nBu yeni müfredat ile öğrencilerin sadece akademik başarıları değil, aynı zamanda sosyal, duygusal ve fiziksel gelişimleri de merkeze alınacak. Geleneksel ezberci eğitim terk edilecek ve proje bazlı öğrenme modeline ağırlık verilecek.\n\nÖğretmenler için bu yaz döneminde kapsamlı hizmet içi eğitim seminerleri düzenlenecek. Yeni ders materyalleri, etkinlik havuzları ve kılavuz kitaplar MEB'in dijital platformlarında erişime açılacak.",
            imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop",
            label: "MEB",
            viewCount: 840,
        }
    ];

    for (const news of mockNews) {
        await prisma.news.create({ data: news });
    }
    console.log("✅ Haberler eklendi!");

    console.log("🎉 Seed işlemi tamamlandı.");
}

// Güvenli (Safe) Promise Chain çalıştırıcısı
main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("HATA:", e);
        await prisma.$disconnect();
        process.exit(1);
    });