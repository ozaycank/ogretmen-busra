import sanitizeHtml from "sanitize-html";
import { marked } from "marked";
import { isNewsHtml } from "@/modules/news/utils/news-content";

const ALLOWED_CLASSES = [
    "ql-align-center",
    "ql-align-right",
    "ql-align-justify",

    "ql-indent-1",
    "ql-indent-2",
    "ql-indent-3",
    "ql-indent-4",
    "ql-indent-5",
    "ql-indent-6",
    "ql-indent-7",
    "ql-indent-8",

    "ql-ui",
];

const SANITIZE_OPTIONS = {
    allowedTags: [
        "p",
        "br",

        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",

        "strong",
        "b",
        "em",
        "i",
        "u",
        "s",
        "strike",
        "del",

        "blockquote",

        "ul",
        "ol",
        "li",

        "a",
        "img",

        "span",

        "pre",
        "code",

        "hr",

        "figure",
        "figcaption",

        "table",
        "thead",
        "tbody",
        "tfoot",
        "tr",
        "th",
        "td",

        "sub",
        "sup",
    ],

    allowedAttributes: {
        a: ["href", "target", "rel", "title"],

        img: [
            "src",
            "alt",
            "title",
            "width",
            "height",
        ],

        p: ["class"],

        h1: ["class"],
        h2: ["class"],
        h3: ["class"],
        h4: ["class"],
        h5: ["class"],
        h6: ["class"],

        blockquote: ["class"],

        ul: ["class"],
        ol: ["class"],
        li: ["class", "data-list"],

        span: ["class"],

        pre: ["class"],
        code: ["class"],

        figure: ["class"],
        figcaption: ["class"],

        table: ["class"],
        thead: ["class"],
        tbody: ["class"],
        tfoot: ["class"],
        tr: ["class"],
        th: ["class", "colspan", "rowspan"],
        td: ["class", "colspan", "rowspan"],
    },

    allowedClasses: {
        "*": ALLOWED_CLASSES,
    },

    // Linklerde javascript:, data: vb. çalıştırılmasını engeller.
    allowedSchemes: ["http", "https", "mailto"],

    // Haber içerisinde yalnızca normal web görsellerine izin veriyoruz.
    allowedSchemesByTag: {
        img: ["http", "https"],
    },

    allowProtocolRelative: false,

    disallowedTagsMode: "discard" as const,

    transformTags: {
        a: (
            tagName: string,
            attribs: Record<string, string>
        ) => {
            const safeAttributes = { ...attribs };

            if (safeAttributes.target === "_blank") {
                safeAttributes.rel = "noopener noreferrer";
            } else if (safeAttributes.target) {
                delete safeAttributes.target;
            }

            return {
                tagName,
                attribs: safeAttributes,
            };
        },
    },
};

/**
 * ReactQuill'den gelen HTML içeriğini güvenli allow-list ile temizler.
 */
export function sanitizeNewsHtml(html: string): string {
    if (!html) return "";

    return sanitizeHtml(html, SANITIZE_OPTIONS);
}

/**
 * Hem yeni ReactQuill HTML haberlerini hem de eski Markdown
 * haberlerini detay sayfasında düzgün HTML olarak render edilebilir
 * hale getirir.
 *
 * ÖNEMLİ:
 * Bu fonksiyon veritabanını değiştirmez.
 */
export function renderNewsContent(content: string): string {
    if (!content) return "";

    const source = content.trim();

    if (!source) return "";

    if (isNewsHtml(source)) {
        return sanitizeNewsHtml(source);
    }

    // Eski Markdown / plain-text haberler.
    const parsedMarkdown = marked.parse(source, {
        gfm: true,
        breaks: true,
        async: false,
    }) as string;

    return sanitizeNewsHtml(parsedMarkdown);
}