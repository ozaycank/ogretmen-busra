import React, { Suspense, cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import crypto from "crypto";
import { Redis } from "@upstash/redis";
import { prisma } from "@/infrastructure/database/prisma";
import { FileStatus, SubjectType, ContentCategory } from "@prisma/client";
import { ChevronRight, Download, Eye, FileText, User, Calendar, FileArchive, FileImage } from "lucide-react";
import MaterialCard from "@/modules/materials/components/MaterialCard";
import SkeletonCard from "@/shared/ui/Skeleton";
import MaterialPreview from "@/modules/materials/components/MaterialPreview";
import ShareButton from "@/shared/ui/ShareButton"; 
import { formatSubject } from "@/shared/constants/curriculum";

// Phase 4 & 6: Single Source of Truth
import { GRADE_LANDING_CONFIG, SUBJECT_TO_SLUG_MAP, ValidGradeSlug } from "../../[gradeSlug]/page";

const redis = Redis.fromEnv();
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const getBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || "https://ogretmenbusra.com";

// FIX 2: Query Deduplication (React Cache)
// generateMetadata ve page component içindeki çift findFirst sorgusunu engeller (N+1'i 1'e indirir).
const getMaterial = cache(async (identifier: string, isId: boolean) => {
  return prisma.material.findFirst({
    where: isId 
      ? { id: identifier, status: FileStatus.APPROVED } 
      : { slug: identifier, status: FileStatus.APPROVED },
  });
});

// FIX 3: Güvenli Kategori Formatlayıcı (Generic Bozucu Kod Yerine Deterministik Mapping)
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
// FIX 4: Gerçek Verilere Dayalı SEO Description Fallback (Sahte İddialar Yok)
function generateSeoDescription(material: any, gradeLabel: string, subjectLabel: string, categoryLabel: string) {
  if (material.description && material.description.trim() !== "") {
    return material.description;
  }
  return `${gradeLabel} ${subjectLabel} dersi için ${material.title} materyali. Eğitim içerikleri ve ${categoryLabel.toLowerCase()}.`;
}

// ==========================================
// METADATA
// ==========================================
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: identifier } = await params;
  const isId = UUID_REGEX.test(identifier);

  const material = await getMaterial(identifier, isId);
  if (!material) return { title: "Materyal Bulunamadı" };

  const gradeKey = Object.keys(GRADE_LANDING_CONFIG).find(
    (key) => GRADE_LANDING_CONFIG[key as ValidGradeSlug].grade === material.grade
  ) as ValidGradeSlug | undefined;

  const gradeLabel = gradeKey ? GRADE_LANDING_CONFIG[gradeKey].label : formatCategory(material.grade); // fallback olarak temiz isim
  const subjectLabel = formatSubject(material.subject as SubjectType);
  const categoryLabel = formatCategory(material.category);
  
  const seoDescription = generateSeoDescription(material, gradeLabel, subjectLabel, categoryLabel);
  const canonicalUrl = `${getBaseUrl()}/materyal/${material.slug}`;

  return {
    title: material.title, // Root template ( | Büşra Öğretmen) kullanılacağı için suffix konulmadı
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

export default async function MaterialDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: identifier } = await params;
  const isId = UUID_REGEX.test(identifier);

  // Cache'lenmiş Data Fetch
  const material = await getMaterial(identifier, isId);
  if (!material) notFound();

  // Phase 2: UUID -> SLUG REDIRECT
  if (isId && material.slug) {
    permanentRedirect(`/materyal/${material.slug}`);
  }

  // FIX 1: Mevcut DB Mutation KORUNUYOR (Görüntülenme Sayacı)
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
    const viewKey = `view:material:${material.id}:${ipHash}`;

    const isNewView = await redis.set(viewKey, "1", { ex: 3600, nx: true });

    if (isNewView) {
      prisma.material.update({
        where: { id: material.id },
        data: { viewCount: { increment: 1 } }
      }).catch((e) => console.error("[DB_ERROR] Görüntülenme artırılamadı:", e));
    }
  } catch (redisError) {
    console.error("[REDIS_ERROR] View cache erişim hatası:", redisError);
  }

  // Semantic Data Preparation
  const gradeKey = Object.keys(GRADE_LANDING_CONFIG).find(
    (key) => GRADE_LANDING_CONFIG[key as ValidGradeSlug].grade === material.grade
  ) as ValidGradeSlug | undefined;
  
  const gradeLabel = gradeKey ? GRADE_LANDING_CONFIG[gradeKey].label : formatCategory(material.grade);
  const gradeLink = gradeKey ? `/${gradeKey}` : `/materyaller?grade=${material.grade}`;
  
  const subjectLabel = formatSubject(material.subject as SubjectType);
  const subjectSlug = SUBJECT_TO_SLUG_MAP[material.subject as SubjectType];
  const subjectLink = (gradeKey && subjectSlug) ? `/${gradeKey}/${subjectSlug}` : `/materyaller?grade=${material.grade}&subject=${material.subject}`;
  
  const categoryLabel = formatCategory(material.category);
  const seoDescription = generateSeoDescription(material, gradeLabel, subjectLabel, categoryLabel);

  // Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": material.title,
    "description": seoDescription,
    "author": { "@type": "Person", "name": material.authorName },
    "educationalLevel": gradeLabel,
    "learningResourceType": categoryLabel,
    "dateCreated": material.createdAt.toISOString(),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-5xl mx-auto space-y-12 pb-12">
        {/* FIX 6 & 7: Breadcrumb Hierarchy */}
        <nav className="flex items-center text-sm font-medium text-slate-500 overflow-x-auto whitespace-nowrap pt-2 pb-4 border-b border-slate-100">
          <Link href="/" className="hover:text-sky-600 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={16} className="mx-2 flex-shrink-0" />
          <Link href={gradeLink} className="hover:text-sky-600 transition-colors">{gradeLabel}</Link>
          <ChevronRight size={16} className="mx-2 flex-shrink-0" />
          <Link href={subjectLink} className="hover:text-sky-600 transition-colors">{subjectLabel}</Link>
          <ChevronRight size={16} className="mx-2 flex-shrink-0" />
          <span className="text-slate-900 truncate max-w-[200px] sm:max-w-xs">{material.title}</span>
        </nav>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start">
            <div className="w-full md:w-72 flex-shrink-0">
              <MaterialPreview 
                fileUrl={material.fileUrl} 
                fileType={material.fileType} 
                title={material.title} 
              />
            </div>
            <div className="flex-1 space-y-6">
              
              {/* CONTEXT BADGES */}
              <div className="flex flex-wrap gap-2">
                <Link href={gradeLink} className="bg-sky-50 hover:bg-sky-100 text-sky-700 px-4 py-1.5 text-xs font-bold rounded-full transition-colors">
                  {gradeLabel}
                </Link>
                <Link href={subjectLink} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-1.5 text-xs font-bold rounded-full transition-colors">
                  {subjectLabel}
                </Link>
                <span className="bg-rose-50 text-rose-700 px-4 py-1.5 text-xs font-bold rounded-full">
                  {categoryLabel}
                </span>
              </div>

              {/* H1 (Gerçek DB Title'ı Kullanılıyor) */}
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                {material.title}
              </h1>

              {/* Açıklayıcı İçerik Alanı (Natural Text) */}
              <div className="prose prose-slate prose-lg">
                <p className="text-slate-600 leading-relaxed">
                  {seoDescription}
                </p>
              </div>

              {/* Bilgi ve İndirme Barları (Aynı bırakıldı) */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 py-4 border-y border-slate-100">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-slate-400"/> 
                  <Link 
                    href={`/yazar/${encodeURIComponent(material.authorName)}`} 
                    className="font-semibold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                  >
                    {material.authorName}
                  </Link>
                </div>
                <div className="flex items-center gap-2"><Calendar size={18} className="text-slate-400"/> {new Date(material.createdAt).toLocaleDateString("tr-TR")}</div>
                <div className="flex items-center gap-2"><Eye size={18} className="text-slate-400"/> {material.viewCount} Görüntülenme</div>
                <div className="flex items-center gap-2"><Download size={18} className="text-slate-400"/> {material.downloadCount} İndirme</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a 
                  href={`/api/download?id=${material.id}`}
                  className="flex-1 flex justify-center items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Download size={24} /> Dosyayı İndir
                </a>
                
                <ShareButton title={material.title} />
              </div>
            </div>
          </div>
        </div>

        {/* Phase 3 Related Materials KORUNUYOR */}
        <div className="space-y-6 pt-8 border-t border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Bunlar da ilginizi çekebilir</h2>
              <p className="text-slate-500 mt-1">Benzer {gradeLabel} {subjectLabel} içeriklerini keşfedin.</p>
            </div>
            <Link href={subjectLink} className="text-sm font-bold text-sky-600 hover:underline">
              Tüm {subjectLabel} İçerikleri →
            </Link>
          </div>
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          }>
            <RelatedMaterials 
              currentId={material.id} 
              grade={material.grade as any} 
              subject={material.subject as any} 
              category={material.category as any} 
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}

// -------------------------------------------------------------
// PHASE 3 — PROGRESSIVE FALLBACK RELATED MATERIALS COMPONENT
// -------------------------------------------------------------
async function RelatedMaterials({ currentId, grade, subject, category }: any) {
  const MAX_RELATED_MATERIALS = 3;
  const excludedIds = [currentId];
  const results: any[] = [];

  const selectContract = {
    id: true, slug: true, title: true, description: true,
    fileType: true, authorName: true, grade: true,
    subject: true, category: true, viewCount: true, downloadCount: true,
  };

  const tier1 = await prisma.material.findMany({
    where: { status: FileStatus.APPROVED, grade, subject, category, id: { notIn: excludedIds } },
    orderBy: { downloadCount: "desc" },
    take: MAX_RELATED_MATERIALS,
    select: selectContract,
  });
  results.push(...tier1);
  excludedIds.push(...tier1.map((m) => m.id));

  if (results.length < MAX_RELATED_MATERIALS) {
    const tier2 = await prisma.material.findMany({
      where: { status: FileStatus.APPROVED, grade, subject, id: { notIn: excludedIds } },
      orderBy: { downloadCount: "desc" },
      take: MAX_RELATED_MATERIALS - results.length,
      select: selectContract,
    });
    results.push(...tier2);
    excludedIds.push(...tier2.map((m) => m.id));
  }

  if (results.length < MAX_RELATED_MATERIALS) {
    const tier3 = await prisma.material.findMany({
      where: { status: FileStatus.APPROVED, grade, id: { notIn: excludedIds } },
      orderBy: { downloadCount: "desc" },
      take: MAX_RELATED_MATERIALS - results.length,
      select: selectContract,
    });
    results.push(...tier3);
  }

  if (results.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {results.map((item) => (
        // Contract korundu, slug Prisma'dan direk m.slug olarak alınıyor.
        <MaterialCard key={item.id} material={{ ...item }} />
      ))}
    </div>
  );
}