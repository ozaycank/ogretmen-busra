/**
 * Haber içeriklerini kartlarda, metadata'da ve okuma süresi hesabında
 * güvenli plain-text'e çevirmek için kullanılan yardımcı fonksiyonlar.
 *
 * Bu dosyada DOM API kullanılmaz.
 * Bu nedenle hem Server Component hem Client Component tarafından kullanılabilir.
 */

const BLOCK_TAG_REGEX =
    /<\/?(?:address|article|aside|blockquote|div|dl|dt|dd|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|thead|tbody|tfoot|tr|td|th|ul)\b[^>]*>/gi;

const BR_TAG_REGEX = /<br\s*\/?>/gi;

const NON_TEXT_BLOCK_REGEX =
    /<(script|style|noscript|iframe|object|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;

const LEADING_HTML_HEADING_REGEX =
    /^\s*<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>\s*/i;

const LEADING_MARKDOWN_HEADING_REGEX =
    /^\s{0,3}#{1,6}\s+.+(?:\r?\n|$)/;

const HTML_CONTENT_REGEX =
    /<(?:p|h[1-6]|div|blockquote|ul|ol|li|br|strong|b|em|i|u|s|strike|a|img|pre|code|table|figure)\b[^>]*>/i;

const HTML_ENTITY_MAP: Record<string, string> = {
    nbsp: " ",
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    hellip: "…",
    ndash: "–",
    mdash: "—",
    lsquo: "‘",
    rsquo: "’",
    ldquo: "“",
    rdquo: "”",
    laquo: "«",
    raquo: "»",
};

export interface PlainTextOptions {
    /**
     * Haber kartında zaten title gösterildiği için içerikteki ilk
     * H1/H2 veya Markdown başlığının tekrar gösterilmesini engeller.
     */
    omitLeadingHeading?: boolean;
}

/**
 * HTML entity'lerini gerçek karakterlerine dönüştürür.
 *
 * Örnek:
 *   &nbsp;  -> boşluk
 *   &#39;   -> '
 *   &#x27;  -> '
 *   &amp;   -> &
 */
export function decodeHtmlEntities(value: string): string {
    if (!value) return "";

    return value.replace(
        /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi,
        (match, entity: string) => {
            const normalized = entity.toLowerCase();

            if (normalized.startsWith("#x")) {
                const codePoint = Number.parseInt(normalized.slice(2), 16);

                if (
                    Number.isFinite(codePoint) &&
                    codePoint > 0 &&
                    codePoint <= 0x10ffff
                ) {
                    try {
                        return String.fromCodePoint(codePoint);
                    } catch {
                        return match;
                    }
                }

                return match;
            }

            if (normalized.startsWith("#")) {
                const codePoint = Number.parseInt(normalized.slice(1), 10);

                if (
                    Number.isFinite(codePoint) &&
                    codePoint > 0 &&
                    codePoint <= 0x10ffff
                ) {
                    try {
                        return String.fromCodePoint(codePoint);
                    } catch {
                        return match;
                    }
                }

                return match;
            }

            return HTML_ENTITY_MAP[normalized] ?? match;
        }
    );
}

/**
 * İçeriğin ReactQuill / HTML rich text olup olmadığını tespit eder.
 *
 * HTML değilse eski sistemden kalan Markdown/plain-text içerik
 * olarak değerlendirilebilir.
 */
export function isNewsHtml(content: string): boolean {
    if (!content) return false;
    return HTML_CONTENT_REGEX.test(content);
}

function removeLeadingHeading(content: string): string {
    return content
        .replace(LEADING_HTML_HEADING_REGEX, "")
        .replace(LEADING_MARKDOWN_HEADING_REGEX, "");
}

/**
 * Eski Markdown kayıtlarının kart önizlemelerinde #, **, []()
 * gibi işaretlerle görünmesini engeller.
 */
function stripMarkdownSyntax(value: string): string {
    return value
        // Markdown görselleri
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")

        // Markdown linkleri
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

        // Markdown heading
        .replace(/(^|\n)\s{0,3}#{1,6}\s+/g, "$1")

        // Blockquote
        .replace(/(^|\n)\s{0,3}>\s?/g, "$1")

        // Liste işaretleri
        .replace(/(^|\n)\s*[-+*]\s+/g, "$1")
        .replace(/(^|\n)\s*\d+\.\s+/g, "$1")

        // Bold
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/__([^_]+)__/g, "$1")

        // Italic
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/_([^_]+)_/g, "$1")

        // Strike
        .replace(/~~([^~]+)~~/g, "$1")

        // Inline code
        .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")

        // Kaçış karakterleri
        .replace(/\\([\\`*{}\[\]()#+\-.!_:>])/g, "$1");
}

/**
 * HTML veya Markdown haber içeriğini kullanıcıya gösterilebilir
 * plain text haline getirir.
 *
 * Bu fonksiyon HTML render ETMEZ.
 * Kart, SEO description ve reading-time gibi alanlar içindir.
 */
export function getNewsPlainText(
    content: string,
    options: PlainTextOptions = {}
): string {
    if (!content) return "";

    let value = String(content);

    if (options.omitLeadingHeading) {
        value = removeLeadingHeading(value);
    }

    // Script/style/iframe gibi içeriklerin kendi text'lerini de kaldır.
    value = value.replace(NON_TEXT_BLOCK_REGEX, " ");

    // HTML comments
    value = value.replace(/<!--[\s\S]*?-->/g, " ");

    // Blokları önce ayırıyoruz.
    // Aksi halde </p><p> gibi yapılar "kelimekelime" olur.
    value = value.replace(BR_TAG_REGEX, "\n");
    value = value.replace(BLOCK_TAG_REGEX, "\n");

    // Kalan inline HTML tagleri.
    value = value.replace(/<[^>]*>/g, " ");

    // HTML entity'leri.
    // İki kere decode ederek &amp;nbsp; gibi çift encode edilmiş
    // eski içerikleri de toparlıyoruz.
    value = decodeHtmlEntities(value);
    value = decodeHtmlEntities(value);

    // Eski Markdown içeriği.
    value = stripMarkdownSyntax(value);

    return value
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Haber kartları için gerçek, sınırlı uzunlukta excerpt oluşturur.
 *
 * Böylece line-clamp kullanılsa bile DOM içine tüm haber metni
 * gönderilmez.
 */
export function createNewsExcerpt(
    content: string,
    maxLength = 220
): string {
    const plainText = getNewsPlainText(content, {
        omitLeadingHeading: true,
    });

    if (!plainText) return "";

    if (plainText.length <= maxLength) {
        return plainText;
    }

    const candidate = plainText.slice(0, maxLength + 1);
    const lastSpace = candidate.lastIndexOf(" ");

    const end =
        lastSpace > Math.floor(maxLength * 0.65)
            ? lastSpace
            : maxLength;

    return `${plainText.slice(0, end).trimEnd()}…`;
}