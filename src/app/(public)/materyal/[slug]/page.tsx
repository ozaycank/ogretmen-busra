import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { notFound, permanentRedirect } from "next/navigation";

import { unstable_cache } from "next/cache";

import { ChevronRight, Download, Eye, User, Calendar } from "lucide-react";

import {
  ContentCategory,
  FileStatus,
  GradeLevel,
  Prisma,
  SubjectType,
} from "@prisma/client";

import { prisma } from "@/infrastructure/database/prisma";

import MaterialCard from "@/modules/materials/components/MaterialCard";
import MaterialPreview from "@/modules/materials/components/MaterialPreview";
import MaterialViewTracker from "@/modules/materials/components/MaterialViewTracker";
import DownloadAnalyticsButton from "@/modules/materials/components/DownloadAnalyticsButton";

import ShareButton from "@/shared/ui/ShareButton";
import SkeletonCard from "@/shared/ui/Skeleton";

import { formatSubject } from "@/shared/constants/curriculum";

import {
  GRADE_LANDING_CONFIG,
  SUBJECT_TO_SLUG_MAP,
  type ValidGradeSlug,
} from "../../[gradeSlug]/page";

export const revalidate = 3600;

const MATERIALS_CACHE_TAG = "materials";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || "https://ogretmenbusra.com";

/*
 * -------------------------------------------------------
 * PRISMA SELECT CONTRACTS
 * -------------------------------------------------------
 */

const materialSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  fileUrl: true,
  fileType: true,
  authorName: true,
  grade: true,
  subject: true,
  category: true,
  viewCount: true,
  downloadCount: true,
  createdAt: true,
} satisfies Prisma.MaterialSelect;

const relatedMaterialSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  fileType: true,
  authorName: true,
  grade: true,
  subject: true,
  category: true,
  viewCount: true,
  downloadCount: true,
} satisfies Prisma.MaterialSelect;

/*
 * ÖNEMLİ:
 *
 * Prisma findMany() metodunun genel ReturnType'ını kullanmıyoruz.
 * Çünkü select uygulanmış sorgu, tam Material modeli değil,
 * yalnızca seçilen alanları döndürür.
 *
 * Bu type tam olarak relatedMaterialSelect içindeki alanlardan
 * oluşturulur.
 */
type RelatedMaterial = Prisma.MaterialGetPayload<{
  select: typeof relatedMaterialSelect;
}>;

/*
 * Build sırasında bütün materyal slug'larını üretmiyoruz.
 *
 * İlk gerçek ziyaret sırasında sayfa oluşturulur ve ardından
 * ISR cache üzerinden tekrar kullanılabilir.
 */
export async function generateStaticParams() {
  return [];
}

/*
 * -------------------------------------------------------
 * MATERIAL DETAIL CACHE
 * -------------------------------------------------------
 */

const getMaterial = unstable_cache(
  async (identifier: string, isId: boolean) => {
    return prisma.material.findFirst({
      where: isId
        ? {
            id: identifier,
            status: FileStatus.APPROVED,
          }
        : {
            slug: identifier,
            status: FileStatus.APPROVED,
          },

      select: materialSelect,
    });
  },

  ["public-material-detail-v3"],

  {
    tags: [MATERIALS_CACHE_TAG],
    revalidate: 3600,
  },
);

/*
 * -------------------------------------------------------
 * RELATED MATERIALS CACHE
 * -------------------------------------------------------
 */

const getRelatedMaterials = unstable_cache(
  async (
    currentId: string,
    grade: GradeLevel,
    subject: SubjectType,
    category: ContentCategory,
  ): Promise<RelatedMaterial[]> => {
    const MAX_RELATED_MATERIALS = 3;

    const excludedIds: string[] = [currentId];

    /*
     * DÜZELTME:
     * Buradaki dizi artık tam Prisma Material[] değil.
     * relatedMaterialSelect ile dönen gerçek partial type.
     */
    const results: RelatedMaterial[] = [];

    /*
     * TIER 1
     * Aynı sınıf + ders + kategori
     */
    const tier1 = await prisma.material.findMany({
      where: {
        status: FileStatus.APPROVED,

        grade,

        subject,

        category,

        id: {
          notIn: excludedIds,
        },
      },

      orderBy: {
        downloadCount: "desc",
      },

      take: MAX_RELATED_MATERIALS,

      select: relatedMaterialSelect,
    });

    results.push(...tier1);

    excludedIds.push(...tier1.map((material) => material.id));

    /*
     * TIER 2
     * Aynı sınıf + ders
     */
    if (results.length < MAX_RELATED_MATERIALS) {
      const tier2 = await prisma.material.findMany({
        where: {
          status: FileStatus.APPROVED,

          grade,

          subject,

          id: {
            notIn: excludedIds,
          },
        },

        orderBy: {
          downloadCount: "desc",
        },

        take: MAX_RELATED_MATERIALS - results.length,

        select: relatedMaterialSelect,
      });

      results.push(...tier2);

      excludedIds.push(...tier2.map((material) => material.id));
    }

    /*
     * TIER 3
     * Aynı sınıf
     */
    if (results.length < MAX_RELATED_MATERIALS) {
      const tier3 = await prisma.material.findMany({
        where: {
          status: FileStatus.APPROVED,

          grade,

          id: {
            notIn: excludedIds,
          },
        },

        orderBy: {
          downloadCount: "desc",
        },

        take: MAX_RELATED_MATERIALS - results.length,

        select: relatedMaterialSelect,
      });

      results.push(...tier3);
    }

    return results;
  },

  ["public-related-materials-v3"],

  {
    tags: [MATERIALS_CACHE_TAG],
    revalidate: 3600,
  },
);

/*
 * -------------------------------------------------------
 * FORMAT HELPERS
 * -------------------------------------------------------
 */

const formatCategory = (category: string) => {
  const map: Record<string, string> = {
    [ContentCategory.ETKINLIK]: "Etkinlik",

    [ContentCategory.ODEV]: "Ödev",

    [ContentCategory.KONU_ANLATIMI]: "Konu Anlatımı",

    [ContentCategory.KODLAMA]: "Kodlama",

    [ContentCategory.BELIRLI_GUN_VE_HAFTALAR]: "Belirli Gün ve Haftalar",

    [ContentCategory.UZMAN_NOTLARI]: "Uzman Notları",

    [ContentCategory.SINIF_MATERYALLERI]: "Sınıf Materyalleri",

    [ContentCategory.PIKTES_TURKCE]: "Piktes Türkçe",

    [ContentCategory.DEGERLER_EGITIMI]: "Değerler Eğitimi",

    [ContentCategory.INTERAKTIF_OYUN]: "İnteraktif Oyun",
  };

  return map[category] || category.replace(/_/g, " ");
};

function generateSeoDescription(
  material: {
    title: string;
    description: string | null;
  },
  gradeLabel: string,
  subjectLabel: string,
  categoryLabel: string,
) {
  if (material.description && material.description.trim() !== "") {
    return material.description;
  }

  return (
    `${gradeLabel} ${subjectLabel} dersi için ` +
    `${material.title} materyali. Eğitim içerikleri ve ` +
    `${categoryLabel.toLowerCase()}.`
  );
}

/*
 * -------------------------------------------------------
 * METADATA
 * -------------------------------------------------------
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug: identifier } = await params;

  const isId = UUID_REGEX.test(identifier);

  const material = await getMaterial(identifier, isId);

  if (!material) {
    return {
      title: "Materyal Bulunamadı",
    };
  }

  const gradeKey = Object.keys(GRADE_LANDING_CONFIG).find(
    (key) =>
      GRADE_LANDING_CONFIG[key as ValidGradeSlug].grade === material.grade,
  ) as ValidGradeSlug | undefined;

  const gradeLabel = gradeKey
    ? GRADE_LANDING_CONFIG[gradeKey].label
    : formatCategory(material.grade);

  const subjectLabel = formatSubject(material.subject);

  const categoryLabel = formatCategory(material.category);

  const seoDescription = generateSeoDescription(
    material,
    gradeLabel,
    subjectLabel,
    categoryLabel,
  );

  const canonicalUrl = `${getBaseUrl()}/materyal/${material.slug}`;

  return {
    title: material.title,

    description: seoDescription,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title: material.title,

      description: seoDescription,

      type: "article",

      url: canonicalUrl,

      authors: [material.authorName],
    },
  };
}

/*
 * -------------------------------------------------------
 * PAGE
 * -------------------------------------------------------
 */

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug: identifier } = await params;

  const isId = UUID_REGEX.test(identifier);

  const material = await getMaterial(identifier, isId);

  if (!material) {
    notFound();
  }

  /*
   * Eski UUID linkleri kalıcı olarak SEO slug'a yönlendirilir.
   */
  if (isId && material.slug) {
    permanentRedirect(`/materyal/${material.slug}`);
  }

  /*
   * -----------------------------------------------------
   * DISPLAY DATA
   * -----------------------------------------------------
   */

  const gradeKey = Object.keys(GRADE_LANDING_CONFIG).find(
    (key) =>
      GRADE_LANDING_CONFIG[key as ValidGradeSlug].grade === material.grade,
  ) as ValidGradeSlug | undefined;

  const gradeLabel = gradeKey
    ? GRADE_LANDING_CONFIG[gradeKey].label
    : formatCategory(material.grade);

  const gradeLink = gradeKey
    ? `/${gradeKey}`
    : `/materyaller?grade=${material.grade}`;

  const subjectLabel = formatSubject(material.subject);

  const subjectSlug = SUBJECT_TO_SLUG_MAP[material.subject];

  const subjectLink =
    gradeKey && subjectSlug
      ? `/${gradeKey}/${subjectSlug}`
      : `/materyaller?grade=${material.grade}&subject=${material.subject}`;

  const categoryLabel = formatCategory(material.category);

  const seoDescription = generateSeoDescription(
    material,
    gradeLabel,
    subjectLabel,
    categoryLabel,
  );

  /*
   * -----------------------------------------------------
   * STRUCTURED DATA
   * -----------------------------------------------------
   */

  const jsonLd = {
    "@context": "https://schema.org",

    "@type": "LearningResource",

    name: material.title,

    description: seoDescription,

    author: {
      "@type": "Person",

      name: material.authorName,
    },

    educationalLevel: gradeLabel,

    learningResourceType: categoryLabel,

    dateCreated: material.createdAt.toISOString(),
  };

  return (
    <>
      {/*
       * Görüntülenme takibi artık page SSR içerisinde Redis/DB
       * çalıştırmaz. Gerçek browser mount olduktan sonra yapılır.
       */}
      <MaterialViewTracker materialId={material.id} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <div className="mx-auto max-w-5xl space-y-12 pb-12">
        {/*
         * ---------------------------------------------------
         * BREADCRUMB
         * ---------------------------------------------------
         */}

        <nav className="flex items-center overflow-x-auto whitespace-nowrap border-b border-slate-100 pt-2 pb-4 text-sm font-medium text-slate-500">
          <Link
            href="/"
            prefetch={false}
            className="transition-colors hover:text-sky-600"
          >
            Ana Sayfa
          </Link>

          <ChevronRight size={16} className="mx-2 flex-shrink-0" />

          <Link
            href={gradeLink}
            prefetch={false}
            className="transition-colors hover:text-sky-600"
          >
            {gradeLabel}
          </Link>

          <ChevronRight size={16} className="mx-2 flex-shrink-0" />

          <Link
            href={subjectLink}
            prefetch={false}
            className="transition-colors hover:text-sky-600"
          >
            {subjectLabel}
          </Link>

          <ChevronRight size={16} className="mx-2 flex-shrink-0" />

          <span className="max-w-[200px] truncate text-slate-900 sm:max-w-xs">
            {material.title}
          </span>
        </nav>

        {/*
         * ---------------------------------------------------
         * MATERIAL MAIN CARD
         * ---------------------------------------------------
         */}

        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm md:p-12">
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/4 rounded-full bg-sky-50 opacity-50 blur-3xl" />

          <div className="relative z-10 flex flex-col items-start gap-10 md:flex-row">
            <div className="w-full flex-shrink-0 md:w-72">
              <MaterialPreview
                fileUrl={material.fileUrl}
                fileType={material.fileType}
                title={material.title}
              />
            </div>

            <div className="flex-1 space-y-6">
              {/*
               * BADGES
               */}

              <div className="flex flex-wrap gap-2">
                <Link
                  href={gradeLink}
                  prefetch={false}
                  className="rounded-full bg-sky-50 px-4 py-1.5 text-xs font-bold text-sky-700 transition-colors hover:bg-sky-100"
                >
                  {gradeLabel}
                </Link>

                <Link
                  href={subjectLink}
                  prefetch={false}
                  className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  {subjectLabel}
                </Link>

                <span className="rounded-full bg-rose-50 px-4 py-1.5 text-xs font-bold text-rose-700">
                  {categoryLabel}
                </span>
              </div>

              {/*
               * TITLE
               */}

              <h1 className="text-3xl leading-tight font-black text-slate-900 md:text-4xl">
                {material.title}
              </h1>

              {/*
               * DESCRIPTION
               */}

              <div className="prose prose-slate prose-lg">
                <p className="leading-relaxed text-slate-600">
                  {seoDescription}
                </p>
              </div>

              {/*
               * META BAR
               */}

              <div className="flex flex-wrap items-center gap-6 border-y border-slate-100 py-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-slate-400" />

                  <Link
                    href={`/yazar/${encodeURIComponent(material.authorName)}`}
                    prefetch={false}
                    className="font-semibold text-sky-600 transition-colors hover:text-sky-700 hover:underline"
                  >
                    {material.authorName}
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-slate-400" />

                  {new Date(material.createdAt).toLocaleDateString("tr-TR")}
                </div>

                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-slate-400" />
                  {material.viewCount} Görüntülenme
                </div>

                <div className="flex items-center gap-2">
                  <Download size={18} className="text-slate-400" />
                  {material.downloadCount} İndirme
                </div>
              </div>

              {/*
               * ACTIONS
               */}

              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <DownloadAnalyticsButton
                  materialId={material.id}
                  materialSlug={material.slug}
                  grade={material.grade}
                  subject={material.subject}
                />

                <ShareButton title={material.title} slug={material.slug} />
              </div>
            </div>
          </div>
        </div>

        {/*
         * ---------------------------------------------------
         * RELATED MATERIALS
         * ---------------------------------------------------
         */}

        <div className="space-y-6 border-t border-slate-100 pt-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Bunlar da ilginizi çekebilir
              </h2>

              <p className="mt-1 text-slate-500">
                Benzer {gradeLabel} {subjectLabel} içeriklerini keşfedin.
              </p>
            </div>

            <Link
              href={subjectLink}
              prefetch={false}
              className="text-sm font-bold text-sky-600 hover:underline"
            >
              Tüm {subjectLabel} İçerikleri →
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {Array.from({
                  length: 3,
                }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            }
          >
            <RelatedMaterials
              currentId={material.id}
              grade={material.grade}
              subject={material.subject}
              category={material.category}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}

/*
 * -------------------------------------------------------
 * RELATED MATERIALS COMPONENT
 * -------------------------------------------------------
 */

async function RelatedMaterials({
  currentId,
  grade,
  subject,
  category,
}: {
  currentId: string;
  grade: GradeLevel;
  subject: SubjectType;
  category: ContentCategory;
}) {
  const results = await getRelatedMaterials(
    currentId,
    grade,
    subject,
    category,
  );

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {results.map((item) => (
        <MaterialCard key={item.id} material={item} />
      ))}
    </div>
  );
}
