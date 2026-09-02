export const MAX_SLUG_LENGTH = 180;

export function slugify(text: string | null | undefined): string {
    if (!text) return "untitled";

    const trMap: Record<string, string> = {
        ç: "c", Ç: "c", ğ: "g", Ğ: "g",
        ı: "i", İ: "i", ö: "o", Ö: "o",
        ş: "s", Ş: "s", ü: "u", Ü: "u",
    };

    let slug = text.replace(/[çÇğĞıİöÖşŞüÜ]/g, (match) => trMap[match]);

    slug = slug.toLowerCase();
    slug = slug.replace(/[^a-z0-9\s-]/g, "");
    slug = slug.replace(/[\s-]+/g, "-");
    slug = slug.replace(/^-+|-+$/g, "");

    return slug || "untitled";
}

function truncateAndClean(slug: string, maxLength: number): string {
    const safeLength = Math.max(0, maxLength);
    let truncated = slug.substring(0, safeLength);
    truncated = truncated.replace(/^-+|-+$/g, ""); // Başta veya sonda kalan tireleri temizle

    // Eğer temizlendikten sonra boş kalırsa, untitled fallback'ini uzunluğa göre kesip ver
    if (!truncated) {
        return "untitled".substring(0, safeLength);
    }
    return truncated;
}

export function createUniqueSlugCandidate(
    baseText: string | null | undefined,
    materialId: string,
    existingSlugs: Set<string>
): string {
    const rawBase = slugify(baseText);
    let candidate = truncateAndClean(rawBase, MAX_SLUG_LENGTH);

    // Eğer ilk üretimde (suffix olmadan) benzersiz ise doğrudan dön
    if (!existingSlugs.has(candidate)) {
        return candidate;
    }

    // Collision durumu: Deterministic suffix ataması
    const uuidPrefix = materialId.substring(0, 8);
    let counter = 0;

    while (true) {
        const suffix = counter === 0 ? `-${uuidPrefix}` : `-${uuidPrefix}-${counter}`;

        // Güvenlik Garantisi: max length hesabından suffix'in uzunluğu çıkarılarak base kelime kesilir.
        const maxBaseLength = MAX_SLUG_LENGTH - suffix.length;
        const truncatedBase = truncateAndClean(rawBase, maxBaseLength);

        candidate = `${truncatedBase}${suffix}`;

        if (!existingSlugs.has(candidate)) {
            return candidate;
        }

        counter++;

        // Sonsuz döngü koruması
        if (counter > 10000) {
            throw new Error(`Infinite loop failsafe triggered for materialId: ${materialId}`);
        }
    }
}