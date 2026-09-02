import "dotenv/config";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { prisma } from "../src/infrastructure/database/prisma";
import { createUniqueSlugCandidate } from "../src/shared/utils/slugify";

const isDryRun = process.argv.includes("--dry-run");

async function verifyTargetEnvironment() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL bulunamadı!");

    try {
        const parsedUrl = new URL(dbUrl);
        const host = parsedUrl.hostname;
        // Hassas bilgileri (user/pass) kesinlikle loglamıyoruz. Sadece Host.
        console.log(`\n⚠️  DİKKAT: Hedef Veritabanı Hostu -> [ ${host} ]`);

        if (!isDryRun) {
            const rl = readline.createInterface({ input, output });
            const answer = await rl.question("Bu veritabanında MUTASYON (Update) işlemini başlatmak istediğinize emin misiniz? Devam etmek için 'PRODUCTION' yazın: ");
            rl.close();

            if (answer !== "PRODUCTION") {
                console.log("İşlem iptal edildi.");
                process.exit(0);
            }
        } else {
            console.log("🔍 DRY RUN MODU AKTİF. Veritabanında hiçbir değişiklik yapılmayacaktır.\n");
        }
    } catch (e) {
        throw new Error("DATABASE_URL parse edilemedi. Lütfen connection string formatını kontrol edin.");
    }
}

async function main() {
    await verifyTargetEnvironment();

    console.log("🚀 Başlıyor: Material Slug Backfill İşlemi");
    const BATCH_SIZE = 100;
    let processedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    try {
        const existingSlugs = new Set<string>();
        const allExistingSlugs = await prisma.material.findMany({
            where: { slug: { not: null } },
            select: { slug: true },
        });

        allExistingSlugs.forEach((m) => existingSlugs.add(m.slug!));

        const materialsToProcess = await prisma.material.findMany({
            where: { slug: null },
            select: { id: true, title: true },
            orderBy: { createdAt: "asc" }
        });

        console.log(`📌 İşlenecek (slug = NULL) kayıt sayısı: ${materialsToProcess.length}`);

        for (let i = 0; i < materialsToProcess.length; i += BATCH_SIZE) {
            const batch = materialsToProcess.slice(i, i + BATCH_SIZE);

            for (const material of batch) {
                try {
                    const finalSlug = createUniqueSlugCandidate(material.title, material.id, existingSlugs);

                    if (isDryRun) {
                        console.log(`[DRY-RUN] ID: ${material.id} | Title: "${material.title}" => Slug: "${finalSlug}"`);
                        existingSlugs.add(finalSlug); // Dry-run simülasyonu için memory'ye ekle
                        updatedCount++;
                        processedCount++;
                        continue;
                    }

                    // GERÇEK MUTASYON (Sadece slug = null ise günceller)
                    const result = await prisma.material.updateMany({
                        where: { id: material.id, slug: null },
                        data: { slug: finalSlug },
                    });

                    if (result.count === 1) {
                        existingSlugs.add(finalSlug);
                        updatedCount++;
                    } else {
                        skippedCount++;
                    }
                } catch (error) {
                    console.error(`❌ Hata (ID: ${material.id}):`, error);
                    failedCount++;
                }
                processedCount++;
            }
            if (!isDryRun) console.log(`⏳ BATCH: ${processedCount} / ${materialsToProcess.length} işlendi.`);
        }

        console.log(`\n✅ ${isDryRun ? "DRY-RUN" : "Backfill"} İşlemi Tamamlandı!`);
        console.log(`   Processed: ${processedCount}`);
        console.log(`   Updated:   ${updatedCount}`);
        console.log(`   Skipped:   ${skippedCount}`);
        console.log(`   Failed:    ${failedCount}`);

    } catch (error) {
        console.error("Beklenmeyen Kritik Hata:", error);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

main();