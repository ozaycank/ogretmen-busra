import "dotenv/config";
import { prisma } from "../src/infrastructure/database/prisma";
import { MAX_SLUG_LENGTH } from "../src/shared/utils/slugify";

async function main() {
    console.log("🔍 Veritabanı Slug Doğrulaması Başlıyor...\n");

    const totalCount = await prisma.material.count();
    const nullSlugCount = await prisma.material.count({ where: { slug: null } });
    const emptySlugCount = await prisma.material.count({ where: { slug: "" } });

    // Katı regex contract: Yalnızca küçük harf, rakam ve aralarda tek tire.
    const validSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    const allMaterialsWithSlug = await prisma.material.findMany({
        where: { slug: { not: null } },
        select: { id: true, slug: true }
    });

    let invalidFormatCount = 0;
    let tooLongCount = 0;
    const slugCounts = new Map<string, number>();

    allMaterialsWithSlug.forEach(m => {
        const slug = m.slug!;

        if (!validSlugRegex.test(slug)) invalidFormatCount++;
        if (slug.length > MAX_SLUG_LENGTH) tooLongCount++;

        slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
    });

    let duplicateSlugCount = 0;
    slugCounts.forEach(count => {
        if (count > 1) duplicateSlugCount++;
    });

    console.log(`📊 A. Toplam Material: ${totalCount}`);
    console.log(`📊 B. Non-Null Slug Kayıtları: ${allMaterialsWithSlug.length}`);
    console.log(`📊 C. Slug NULL Sayısı: ${nullSlugCount}`);
    console.log(`📊 D. Empty Slug Sayısı: ${emptySlugCount}`);
    console.log(`📊 E. Invalid Format Sayısı: ${invalidFormatCount}`);
    console.log(`📊 F. Aşırı Uzun (>${MAX_SLUG_LENGTH}) Slug Sayısı: ${tooLongCount}`);
    console.log(`📊 G. Duplicate Slug Sayısı: ${duplicateSlugCount}`);

    // Doğrulama Kriterleri
    const isValid =
        totalCount === allMaterialsWithSlug.length &&
        nullSlugCount === 0 &&
        emptySlugCount === 0 &&
        duplicateSlugCount === 0 &&
        invalidFormatCount === 0 &&
        tooLongCount === 0;

    if (isValid) {
        console.log("\n✅ DOĞRULAMA BAŞARILI: Veritabanı Phase 2 (Unique Constraint) için HAZIR!");
    } else {
        console.error("\n❌ DOĞRULAMA BAŞARISIZ: Yukarıdaki istatistiklerde hatalı satırlar tespit edildi.");
        process.exitCode = 1;
    }
}

main().finally(async () => await prisma.$disconnect());