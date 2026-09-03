import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/infrastructure/database/prisma";
import { GradeLevel, SubjectType, FileStatus } from "@prisma/client";
import { ChevronRight, FileText, SearchX } from "lucide-react";
import MaterialCard from "@/modules/materials/components/MaterialCard";
import { formatSubject } from "@/shared/constants/curriculum";

// =====================================================================
// SHARED CONFIGURATIONS (Source of Truth - Faz 4 ve Faz 6 için Ortak)
// =====================================================================
export const GRADE_LANDING_CONFIG = {
  "okul-oncesi": {
    grade: GradeLevel.OKUL_ONCESI,
    title: "Okul Öncesi Etkinlikleri ve Eğitim Materyalleri",
    description: "Okul öncesi (anasınıfı) öğrencileri için boyama, çizgi çalışmaları, motor beceri ve okul hazırlık etkinliklerini ücretsiz keşfedin.",
    label: "Okul Öncesi",
  },
  "1-sinif": {
    grade: GradeLevel.SINIF_1,
    title: "1. Sınıf Etkinlikleri ve Eğitim Materyalleri",
    description: "1. sınıf öğrencileri için ilk okuma yazma, çizgi çalışmaları, temel matematik ve sınıf içi etkinlikleri ücretsiz indirin.",
    label: "1. Sınıf",
  },
  "2-sinif": {
    grade: GradeLevel.SINIF_2,
    title: "2. Sınıf Çalışma Kağıtları ve Eğitim Materyalleri",
    description: "2. sınıf okuduğunu anlama, hayat bilgisi, matematik etkinlikleri ve ödev çalışma kağıtlarını hemen inceleyin.",
    label: "2. Sınıf",
  },
  "3-sinif": {
    grade: GradeLevel.SINIF_3,
    title: "3. Sınıf Konu Anlatımları ve Etkinlik Materyalleri",
    description: "3. sınıf fen bilimleri, matematik, Türkçe ve hayat bilgisi derslerine yönelik pekiştirici eğitim materyalleri.",
    label: "3. Sınıf",
  },
  "4-sinif": {
    grade: GradeLevel.SINIF_4,
    title: "4. Sınıf Sınav Hazırlık ve Eğitim Materyalleri",
    description: "4. sınıf öğrencileri için tüm dersleri kapsayan deneme sınavları, etkinlikler ve çalışma kağıtlarını ücretsiz keşfedin.",
    label: "4. Sınıf",
  },
  "genel-materyaller": {
    grade: GradeLevel.GENEL,
    title: "Genel Eğitim Materyalleri ve Sınıf Süsleri",
    description: "Tüm kademeler için uygun belirli gün ve haftalar etkinlikleri, sınıf pano süsleri ve genel öğretmen materyalleri.",
    label: "Genel Materyaller",
  },
} as const;

export const SUBJECT_TO_SLUG_MAP: Partial<Record<SubjectType, string>> = {
  [SubjectType.TURKCE]: "turkce",
  [SubjectType.MATEMATIK]: "matematik",
  [SubjectType.HAYAT_BILGISI]: "hayat-bilgisi",
  [SubjectType.FEN_BILIMLERI]: "fen-bilimleri",
  [SubjectType.SOSYAL_BILGILER]: "sosyal-bilgiler",
  [SubjectType.INGILIZCE]: "ingilizce",
  [SubjectType.GORSEL_SANATLAR]: "gorsel-sanatlar",
  [SubjectType.MUZIK]: "muzik",
  [SubjectType.BEDEN_EGITIMI]: "beden-egitimi",
  [SubjectType.BILISIM]: "bilisim",
  [SubjectType.SERBEST_ETKINLIK]: "serbest-etkinlik",
  [SubjectType.REHBERLIK]: "rehberlik",
  [SubjectType.DIL_VE_KONUSMA]: "dil-ve-konusma",
  [SubjectType.MOTOR_GELISIM]: "motor-gelisim",
};

export type ValidGradeSlug = keyof typeof GRADE_LANDING_CONFIG;

// =====================================================================

const getBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || "https://ogretmenbusra.com";

export async function generateMetadata({ params }: { params: Promise<{ gradeSlug: string }> }): Promise<Metadata> {
  const { gradeSlug } = await params;

  if (!(gradeSlug in GRADE_LANDING_CONFIG)) {
    return { title: "Sayfa Bulunamadı" };
  }

  const config = GRADE_LANDING_CONFIG[gradeSlug as ValidGradeSlug];
  const canonicalUrl = `${getBaseUrl()}/${gradeSlug}`;

  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: config.title,
      description: config.description,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function GradeLandingPage({ params }: { params: Promise<{ gradeSlug: string }> }) {
  const { gradeSlug } = await params;

  if (!(gradeSlug in GRADE_LANDING_CONFIG)) {
    notFound();
  }

  const config = GRADE_LANDING_CONFIG[gradeSlug as ValidGradeSlug];
  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/${gradeSlug}`;

  const materials = await prisma.material.findMany({
    where: {
      status: FileStatus.APPROVED,
      grade: config.grade,
    },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true, slug: true, title: true, description: true,
      fileType: true, authorName: true, grade: true,
      subject: true, category: true, viewCount: true, downloadCount: true,
    },
  });

  let activeSubjects: { subject: string; slug: string; _count: number }[] = [];
  if (materials.length > 0) {
    const subjectGroups = await prisma.material.groupBy({
      by: ['subject'],
      where: {
        status: FileStatus.APPROVED,
        grade: config.grade,
        subject: { not: SubjectType.TUM_DERSLER }
      },
      _count: { subject: true },
    });
    
    activeSubjects = subjectGroups
      .filter(g => g._count.subject > 0 && SUBJECT_TO_SLUG_MAP[g.subject])
      .map(g => ({
        subject: g.subject,
        slug: SUBJECT_TO_SLUG_MAP[g.subject] as string,
        _count: g._count.subject
      }));
  }

  const isEmpty = materials.length === 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": config.title,
    "description": config.description,
    "url": canonicalUrl,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": baseUrl },
        { "@type": "ListItem", "position": 2, "name": config.label, "item": canonicalUrl }
      ]
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-6xl mx-auto pb-16 space-y-12">
        <nav className="flex items-center text-sm font-medium text-slate-500 overflow-x-auto whitespace-nowrap pt-4">
          <Link href="/" className="hover:text-sky-600 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={16} className="mx-2 flex-shrink-0" />
          <span className="text-slate-900">{config.label} Etkinlikleri</span>
        </nav>

        <header className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-[2.5rem] p-8 md:p-14 border border-sky-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <FileText size={200} />
          </div>
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              SEO Eğitim Arşivi
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
              {config.title}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              {config.description}
            </p>
          </div>
        </header>

        {activeSubjects.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Bu Sınıftaki Dersler</h2>
            <div className="flex flex-wrap gap-3">
              {activeSubjects.map((s) => (
                <Link 
                  key={s.subject}
                  // FIX 3: Eski /materyaller?grade=X&subject=Y kullanımı kaldırıldı.
                  href={`/${gradeSlug}/${s.slug}`}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-300 hover:shadow-md hover:text-sky-700 transition-all font-semibold text-slate-600 flex items-center gap-2"
                >
                  {formatSubject(s.subject as SubjectType)}
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">
                    {s._count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900">En Yeni İçerikler</h2>
            {!isEmpty && (
              <Link href={`/materyaller?grade=${config.grade}`} className="text-sky-600 font-bold hover:underline hidden sm:block">
                Tümünü Gör &rarr;
              </Link>
            )}
          </div>

          {isEmpty ? (
            <div className="flex flex-col items-center justify-center bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
              <div className="bg-slate-50 p-6 rounded-full text-slate-400 mb-4">
                <SearchX size={48} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Henüz İçerik Eklenmemiş</h3>
              <p className="text-slate-500 max-w-md mb-6">
                Bu sınıfa ait eğitim materyalleri ve etkinlikler şu an hazırlanıyor. Lütfen daha sonra tekrar kontrol edin.
              </p>
              <Link href="/materyaller" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                Tüm Materyalleri Keşfet
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((m) => (
                // FIX 2: slug: m.slug ?? "" gibi masking'ler kaldırıldı. Prisma contract'ına tam güvenildi.
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          )}
        </section>

        <section className="pt-12 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-500 mb-4">Diğer Kademeleri Keşfet</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(GRADE_LANDING_CONFIG)
              .filter(([key]) => key !== gradeSlug)
              .map(([key, val]) => (
                <Link 
                  key={key} 
                  href={`/${key}`}
                  className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-sm font-semibold"
                >
                  {val.label}
                </Link>
              ))}
          </div>
        </section>

      </div>
    </>
  );
}