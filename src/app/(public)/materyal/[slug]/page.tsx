import React, { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import crypto from "crypto";
import { Redis } from "@upstash/redis";
import { prisma } from "@/infrastructure/database/prisma";
import { FileStatus } from "@prisma/client";
import { ChevronRight, Download, Eye, FileText, User, Calendar, FileArchive, FileImage } from "lucide-react";
import MaterialCard from "@/modules/materials/components/MaterialCard";
import SkeletonCard from "@/shared/ui/Skeleton";
import MaterialPreview from "@/modules/materials/components/MaterialPreview";
import ShareButton from "@/shared/ui/ShareButton"; 

// Initialize Upstash Redis instance
const redis = Redis.fromEnv();

// ZORUNLU EKLENTİ: UUID Tespit Regex'i
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 1. Dinamik SEO (OpenGraph) Metadata Üretimi
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: identifier } = await params;
  const isId = UUID_REGEX.test(identifier);

  // findFirst kullanarak Prisma Schema cache/typescript uyumsuzluklarını önlüyoruz
  const material = await prisma.material.findFirst({ 
    where: isId ? { id: identifier, status: FileStatus.APPROVED } : { slug: identifier, status: FileStatus.APPROVED } 
  });

  if (!material) return { title: "Materyal Bulunamadı" };

  return {
    title: `${material.title} | Büşra Öğretmen`,
    description: material.description || `${material.grade} seviyesi için ${material.category} materyali.`,
    alternates: {
      canonical: `/materyal/${material.slug}`, // Canonical URL her zaman slug olmalıdır
    },
    openGraph: {
      title: material.title,
      description: material.description || "Eğitim materyalini indirmek için tıklayın.",
      type: "article",
      url: `/materyal/${material.slug}`,
      authors: [material.authorName],
    },
  };
}

// Format Yardımcıları
const formatEnum = (text: string) => text.replace(/_/g, " ").replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf": case "docx": case "doc": return <FileText className="text-[#0284c7]" size={48} />;
    case "jpeg": case "jpg": case "png": return <FileImage className="text-emerald-500" size={48} />;
    case "zip": case "rar": return <FileArchive className="text-amber-500" size={48} />;
    default: return <FileText className="text-gray-400" size={48} />;
  }
};

export default async function MaterialDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: identifier } = await params;
  const isId = UUID_REGEX.test(identifier);

  // Ana veriyi çek - findFirst ile TypeScript TS2322 hatası önlenir
  const material = await prisma.material.findFirst({
    where: isId ? { id: identifier, status: FileStatus.APPROVED } : { slug: identifier, status: FileStatus.APPROVED },
  });

  if (!material) notFound();

  // MIGRATION YÖNLENDİRMESİ: Eğer UUID ile gelindiyse, yeni Slug URL'ye 308 Kalıcı olarak yönlendir
  if (isId && material.slug) {
    permanentRedirect(`/materyal/${material.slug}`);
  }

  // Arka planda güvenli ve rate-limit korumalı görüntülenme sayısını artır
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
    // KVKK/GDPR uyumluluğu için IP adresini hashliyoruz
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
    const viewKey = `view:material:${material.id}:${ipHash}`;

    // Redis üzerinde 1 saatlik (3600 sn) kilit oluştur (Sadece ilk istekte başarılı olur)
    const isNewView = await redis.set(viewKey, "1", { ex: 3600, nx: true });

    if (isNewView) {
      prisma.material.update({
        where: { id: material.id },
        data: { viewCount: { increment: 1 } }
      }).catch((e) => console.error("[DB_ERROR] Görüntülenme artırılamadı:", e));
    }
  } catch (redisError) {
    // Redis çökerse DB'yi korumak adına sessizce fail veriyoruz, sayfa yüklenmeye devam ediyor
    console.error("[REDIS_ERROR] View cache erişim hatası:", redisError);
  }

  // JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": material.title,
    "description": material.description,
    "author": { "@type": "Person", "name": material.authorName },
    "educationalLevel": formatEnum(material.grade),
    "learningResourceType": formatEnum(material.category),
    "dateCreated": material.createdAt.toISOString(),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-5xl mx-auto space-y-12 pb-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm font-medium text-slate-500 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-sky-600 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={16} className="mx-2 flex-shrink-0" />
          <Link href="/materyaller" className="hover:text-sky-600 transition-colors">Materyaller</Link>
          <ChevronRight size={16} className="mx-2 flex-shrink-0" />
          <Link href={`/materyaller?grade=${material.grade}`} className="hover:text-sky-600 transition-colors">{formatEnum(material.grade)}</Link>
          <ChevronRight size={16} className="mx-2 flex-shrink-0" />
          <span className="text-slate-900 truncate max-w-xs">{material.title}</span>
        </nav>

        {/* Ana Detay Kartı */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start">
            {/* Sol: Materyal Önizlemesi */}
            <div className="w-full md:w-72 flex-shrink-0">
              <MaterialPreview 
                fileUrl={material.fileUrl} 
                fileType={material.fileType} 
                title={material.title} 
              />
            </div>
            {/* Sağ: İçerik ve Butonlar */}
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="bg-sky-50 text-sky-700 px-4 py-1.5 text-xs font-bold rounded-full">{formatEnum(material.grade)}</span>
                <span className="bg-rose-50 text-rose-700 px-4 py-1.5 text-xs font-bold rounded-full">{formatEnum(material.category)}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                {material.title}
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed">
                {material.description || "Bu materyal için henüz bir açıklama eklenmemiş."}
              </p>

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
                
                {/* İNTERAKTİF PAYLAŞ BUTONU */}
                <ShareButton title={material.title} />

              </div>
            </div>
          </div>
        </div>

        {/* İlgili Materyaller (Öneri Motoru) */}
        <div className="space-y-6 pt-8">
          <h2 className="text-2xl font-black text-slate-900">Bunlar da ilginizi çekebilir</h2>
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          }>
            <RelatedMaterials category={material.category} currentId={material.id} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

// -------------------------------------------------------------
// İLGİLİ MATERYALLER BİLEŞENİ
// -------------------------------------------------------------
async function RelatedMaterials({ category, currentId }: { category: string, currentId: string }) {
  const related = await prisma.material.findMany({
    where: { 
      status: FileStatus.APPROVED,
      category: category as any,
      id: { not: currentId }
    },
    orderBy: { downloadCount: "desc" },
    take: 3,
  });

  if (related.length === 0) {
    return <p className="text-slate-500">Bu kategoride henüz başka bir materyal bulunmuyor.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* material.slug'ın DB'de NOT NULL olduğu kesinleştiği için TypeScript'e 'as string' ile güvence veriyoruz */}
      {related.map((item) => (
        <MaterialCard key={item.id} material={{...item, slug: item.slug as string}} />
      ))}
    </div>
  );
}