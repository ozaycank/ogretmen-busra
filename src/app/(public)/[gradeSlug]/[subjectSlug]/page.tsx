import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/infrastructure/database/prisma";
import { SubjectType, FileStatus } from "@prisma/client";
import { ChevronRight, FileText } from "lucide-react";
import MaterialCard from "@/modules/materials/components/MaterialCard";
import { formatSubject } from "@/shared/constants/curriculum";

// Tek Source of Truth'u (Faz 4 dosyasından) İçeri Aktarıyoruz
import { GRADE_LANDING_CONFIG, SUBJECT_TO_SLUG_MAP, ValidGradeSlug } from "../page";

const getBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || "https://ogretmenbusra.com";

// Ters Mapping Oluşturucu (Slug -> Enum)
const SLUG_TO_SUBJECT_MAP: Record<string, SubjectType> = Object.entries(SUBJECT_TO_SLUG_MAP).reduce((acc, [key, value]) => {
  acc[value as string] = key as SubjectType;
  return acc;
}, {} as Record<string, SubjectType>);


export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ gradeSlug: string; subjectSlug: string }> 
}): Promise<Metadata> {
  const { gradeSlug, subjectSlug } = await params;

  const config = GRADE_LANDING_CONFIG[gradeSlug as ValidGradeSlug];
  const targetSubject = SLUG_TO_SUBJECT_MAP[subjectSlug];

  if (!config || !targetSubject || targetSubject === SubjectType.TUM_DERSLER) {
    return { title: "Sayfa Bulunamadı" };
  }

  // FIX 1: Hatalı formatGradeName silindi. Sınıf ismi (label) %100 doğru config'ten çekildi.
  const gradeName = config.label; 
  const subjectName = formatSubject(targetSubject);
  const canonicalUrl = `${getBaseUrl()}/${gradeSlug}/${subjectSlug}`;

  const title = `${gradeName} ${subjectName} Etkinlikleri ve Eğitim Materyalleri`;
  const description = `${gradeName} ${subjectName} dersi için ücretsiz çalışma kağıtları, etkinlikler, konu anlatımları ve eğitim materyallerini keşfedin.`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
  };
}


export default async function SubjectLandingPage({ 
  params 
}: { 
  params: Promise<{ gradeSlug: string; subjectSlug: string }> 
}) {
  const { gradeSlug, subjectSlug } = await params;

  const config = GRADE_LANDING_CONFIG[gradeSlug as ValidGradeSlug];
  const targetSubject = SLUG_TO_SUBJECT_MAP[subjectSlug];

  if (!config || !targetSubject || targetSubject === SubjectType.TUM_DERSLER) {
    notFound();
  }

  const targetGrade = config.grade;
  const materials = await prisma.material.findMany({
    where: {
      status: FileStatus.APPROVED,
      grade: targetGrade,
      subject: targetSubject,
    },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true, slug: true, title: true, description: true,
      fileType: true, authorName: true, grade: true,
      subject: true, category: true, viewCount: true, downloadCount: true,
    },
  });

  if (materials.length === 0) {
    notFound();
  }

  const siblingGroups = await prisma.material.groupBy({
    by: ['subject'],
    where: {
      status: FileStatus.APPROVED,
      grade: targetGrade,
      subject: { not: SubjectType.TUM_DERSLER } 
    },
    _count: { subject: true },
  });
  
  const activeSiblings = siblingGroups
    .filter(g => g._count.subject > 0 && g.subject !== targetSubject && SUBJECT_TO_SLUG_MAP[g.subject])
    .map(g => ({
      subject: g.subject,
      slug: SUBJECT_TO_SLUG_MAP[g.subject] as string,
    }));

  const gradeName = config.label; // FIX 1: Doğru Sınıf Adı
  const subjectName = formatSubject(targetSubject);
  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/${gradeSlug}/${subjectSlug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${gradeName} ${subjectName} Etkinlikleri`,
    "description": `${gradeName} ${subjectName} dersi için eğitim materyalleri.`,
    "url": canonicalUrl,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": baseUrl },
        { "@type": "ListItem", "position": 2, "name": `${gradeName} Materyalleri`, "item": `${baseUrl}/${gradeSlug}` },
        { "@type": "ListItem", "position": 3, "name": subjectName, "item": canonicalUrl }
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
          <Link href={`/${gradeSlug}`} className="hover:text-sky-600 transition-colors">{gradeName} Materyalleri</Link>
          <ChevronRight size={16} className="mx-2 flex-shrink-0" />
          <span className="text-slate-900">{subjectName}</span>
        </nav>

        <header className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[2.5rem] p-8 md:p-14 border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <FileText size={200} />
          </div>
          <div className="relative z-10 max-w-3xl">
            <Link 
              href={`/${gradeSlug}`} 
              className="inline-flex items-center gap-2 bg-white/60 hover:bg-white text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6 transition-colors shadow-sm"
            >
              ← Tüm {gradeName} Dersleri
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
              {gradeName} {subjectName} Materyalleri
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              {gradeName} {subjectName} dersi için öğretmenlerimiz tarafından paylaşılan etkinlikler, çalışma kağıtları ve materyaller.
            </p>
          </div>
        </header>

        {activeSiblings.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Diğer {gradeName} Dersleri</h2>
            <div className="flex flex-wrap gap-3">
              {activeSiblings.map((s) => (
                <Link 
                  key={s.subject}
                  href={`/${gradeSlug}/${s.slug}`}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md hover:text-emerald-700 transition-all font-semibold text-slate-600"
                >
                  {formatSubject(s.subject as SubjectType)}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900">En Yeni İçerikler</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((m) => (
              // FIX 2: Type Masking kaldırıldı.
              <MaterialCard key={m.id} material={m} />
            ))}
          </div>

          <div className="mt-8 text-center">
             <Link 
                href={`/materyaller?grade=${targetGrade}&subject=${targetSubject}`} 
                className="inline-block bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md"
              >
                Gelişmiş Arama ile Tümünü Gör
             </Link>
          </div>
        </section>

      </div>
    </>
  );
}