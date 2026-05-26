import "dotenv/config"; // .env dosyasındaki değişkenleri okumak için
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db/prisma"; // Uygulamadaki yapılandırılmış Prisma istemcisi

async function main() {
    console.log("Admin kullanıcısı oluşturuluyor...");

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

    console.log("✅ Admin kullanıcısı başarıyla oluşturuldu!");
}

main()
    .catch((e) => {
        console.error("HATA:", e);
        process.exit(1);
    })
    .finally(async () => {
        // İşlem bitince veritabanı bağlantısını güvenlice kapatıyoruz
        await prisma.$disconnect();
    });