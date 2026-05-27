import "dotenv/config";
import { Role, FileStatus, GradeLevel, ContentCategory } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db/prisma";
import crypto from "crypto";

async function main() {
    console.log("🌱 Veritabanı seed işlemi başlatılıyor...");

    // 1. Admin Kullanıcısı Oluşturma
    console.log("Kullanıcılar kontrol ediliyor...");
    const hash = await bcrypt.hash("GuvenliSifre123!", 12);
    await prisma.user.upsert({
        where: { email: "admin@busraogretmen.com" },
        update: {},
        create: {
            email: "admin@busraogretmen.com",
            name: "Sistem Yöneticisi",
            passwordHash: hash,
            role: Role.ADMIN,
        },
    });
    console.log("✅ Admin kullanıcısı hazır!");

    // 2. Sahte Eğitim Materyalleri (Mock Data) Oluşturma
    console.log("Mock eğitim materyalleri ekleniyor...");

    // Veritabanını kirletmemek için daha önceki seed materyallerini (opsiyonel olarak) silebiliriz.
    // await prisma.material.deleteMany({}); 

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
        },
        {
            title: "Scratch İle İlk Kodlama Oyunu",
            description: "Blok tabanlı kodlama eğitiminde ilk ders için kullanabileceğiniz kedi yakalama oyunu yapımı adım adım yönergeleri.",
            authorName: "Büşra Öğretmen",
            grade: GradeLevel.GENEL,
            category: ContentCategory.KODLAMA,
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            fileType: "docx",
        },
        {
            title: "2. Sınıf Matematik Toplama Çıkarma Problemleri",
            description: "Hafta sonu ödevi olarak verilebilecek, günlük hayatla ilişkilendirilmiş 20 adet kolay ve orta seviye matematik problemi.",
            authorName: "Zeynep Öğretmen",
            grade: GradeLevel.SINIF_2,
            category: ContentCategory.ODEV,
            mimeType: "application/pdf",
            fileType: "pdf",
        },
        {
            title: "Okul Öncesi Renkler ve Şekiller Eşleştirme Oyunu",
            description: "Anaokulu öğrencileri için ince motor becerilerini geliştirecek renk ve şekil eşleştirme kartları.",
            authorName: "Ayşe Hanım",
            grade: GradeLevel.OKUL_ONCESI,
            category: ContentCategory.ETKINLIK,
            mimeType: "image/jpeg",
            fileType: "jpeg",
        },
        {
            title: "3. Sınıf Hayat Bilgisi Güvenli Hayat Özeti",
            description: "Sınav öncesi tekrar yapabilmek için hazırlanmış tek sayfalık zihin haritası ve konu özeti.",
            authorName: "Büşra Öğretmen",
            grade: GradeLevel.SINIF_3,
            category: ContentCategory.KONU_ANLATIMI,
            mimeType: "application/pdf",
            fileType: "pdf",
        },
        {
            title: "23 Nisan Ulusal Egemenlik ve Çocuk Bayramı Boyama Sayfaları",
            description: "Sınıf panosunu süslemek için kullanılabilecek, çocukların çok seveceği 5 farklı 23 Nisan temalı boyama sayfası.",
            authorName: "Mustafa Öğretmen",
            grade: GradeLevel.GENEL,
            category: ContentCategory.BELIRLI_GUN_VE_HAFTALAR,
            mimeType: "application/zip",
            fileType: "zip",
        },
        {
            title: "Değerler Eğitimi: Dürüstlük ve Güven Hikayesi",
            description: "Serbest etkinlik saatlerinde okunup üzerinde tartışılabilecek, dürüstlük temasını işleyen kısa çocuk hikayesi.",
            authorName: "Fatma Öğretmen",
            grade: GradeLevel.GENEL,
            category: ContentCategory.DEGERLER_EGITIMI,
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            fileType: "docx",
        },
        {
            title: "1. Sınıf Rakamları Yazıyorum Çalışma Yaprağı",
            description: "1'den 9'a kadar rakamların doğru yazım yönlerini gösteren kılavuz çizgili çalışma sayfası.",
            authorName: "Büşra Öğretmen",
            grade: GradeLevel.SINIF_1,
            category: ContentCategory.ETKINLIK,
            mimeType: "application/pdf",
            fileType: "pdf",
        },
        {
            title: "4. Sınıf Sosyal Bilgiler Milli Mücadele Kahramanları",
            description: "Milli mücadele dönemi kahramanlarımızın hayatlarını kısaca anlatan, resimli araştırma ödevi şablonu.",
            authorName: "Kemal Bey",
            grade: GradeLevel.SINIF_4,
            category: ContentCategory.ODEV,
            mimeType: "application/pdf",
            fileType: "pdf",
        },
        {
            title: "Tutum, Yatırım ve Türk Malları Haftası Taç Kalıbı",
            description: "Yerli malı haftasında öğrencilerin kafalarına takabilmesi için tasarlanmış meyve figürlü taç şablonu.",
            authorName: "Büşra Öğretmen",
            grade: GradeLevel.GENEL,
            category: ContentCategory.BELIRLI_GUN_VE_HAFTALAR,
            mimeType: "image/png",
            fileType: "png",
        },
        {
            title: "3. Sınıf Fen Bilimleri Duyu Organlarımız Deneyi",
            description: "Sınıf ortamında basit malzemelerle yapılabilecek, tat ve koku duyularını test eden eğlenceli bir deney yönergesi.",
            authorName: "Elif Öğretmen",
            grade: GradeLevel.SINIF_3,
            category: ContentCategory.ETKINLIK,
            mimeType: "application/pdf",
            fileType: "pdf",
        },
        {
            title: "Okul Öncesi Makas Kullanımı Çalışmaları",
            description: "Çizgi üzerinden kesme becerisini geliştirecek, zorluk derecesi artan 4 farklı kesme çalışması.",
            authorName: "Ayşe Hanım",
            grade: GradeLevel.OKUL_ONCESI,
            category: ContentCategory.ETKINLIK,
            mimeType: "application/pdf",
            fileType: "pdf",
        },
        {
            title: "Code.org Ders-2 Çevrimdışı Yönerge Yönleri",
            description: "Bilgisayarsız kodlama (unplugged coding) etkinliği için sağ, sol, yukarı, aşağı komut okları şablonu.",
            authorName: "Büşra Öğretmen",
            grade: GradeLevel.GENEL,
            category: ContentCategory.KODLAMA,
            mimeType: "application/pdf",
            fileType: "pdf",
        },
        {
            title: "2. Sınıf Türkçe Zıt Anlamlı Kelimeler Tombalası",
            description: "Zıt anlamlı kelimeleri öğretirken sınıfça oynanabilecek eğitsel tombala materyali.",
            authorName: "Zeynep Öğretmen",
            grade: GradeLevel.SINIF_2,
            category: ContentCategory.INTERAKTIF_OYUN,
            mimeType: "application/pdf",
            fileType: "pdf",
        }
    ];

    for (const material of mockMaterials) {
        // Her veri için benzersiz R2 ID'si oluşturuyoruz
        const uuid = crypto.randomUUID();

        await prisma.material.create({
            data: {
                title: material.title,
                description: material.description,
                authorName: material.authorName,
                grade: material.grade,
                category: material.category,
                fileType: material.fileType,
                mimeType: material.mimeType,

                // Sahte Teknik Veriler
                fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB ile 5MB arası
                fileKey: `mock/${uuid}.${material.fileType}`,
                originalName: `mock_dosya_${uuid.substring(0, 5)}.${material.fileType}`,
                fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // Dummy indirme linki

                status: FileStatus.APPROVED, // Test için onaylı gelsin

                // Rastgele görüntülenme ve indirme istatistikleri
                viewCount: Math.floor(Math.random() * 1500) + 50,
                downloadCount: Math.floor(Math.random() * 800) + 10,

                // Güvenlik ID'leri
                ipHash: "seed_script_ip_mock",
                turnstileToken: crypto.randomUUID(),
            }
        });
    }

    console.log(`✅ Toplam ${mockMaterials.length} adet sahte materyal başarıyla eklendi!`);
    console.log("🎉 Seed işlemi tamamlandı.");
}

main()
    .catch((e) => {
        console.error("HATA:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });