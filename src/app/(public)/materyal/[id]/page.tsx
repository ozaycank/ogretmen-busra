import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { FileStatus } from "@prisma/client";
import { ChevronRight, Download, Eye, FileText, User, Calendar, Share2, FileArchive, FileImage } from "lucide-react";
import MaterialCard from "@/components/features/MaterialCard";
import SkeletonCard from "@/components/ui/Skeleton";

// 1. Dinamik SEO (OpenGraph) Metadata Üretimi
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const material = await prisma.material.findUnique({ where: { id, status: FileStatus.APPROVED } });

  if (!material) return { title: "Materyal Bulunamadı" };

  return {
    title: `${material.title} | Büşra Öğretmen`,
    description: material.description || `${material.grade} seviyesi için ${material.category} materyali.`,
    openGraph: {
      title: material.title,
      description: material.description || "Eğitim materyalini indirmek için tıklayın.",
      type: "article",
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

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Ana veriyi çek
  const material = await prisma.material.findUnique({
    where: { id, status: FileStatus.APPROVED },
  });

  if (!material) notFound();

  // Arka planda görüntülenme sayısını artır (Next.js request'ini bloklamaması için await etmiyoruz)
  prisma.material.update({
    where: { id },
    data: { viewCount: { increment: 1 } }
  }).catch(() => {}); // Olası hataları sessizce yut

  // JSON-LD Schema (Google Eğitim Materyali Zengin Sonuçları için)
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
            
            {/* Sol: Dosya Önizleme / İkon Alanı */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="aspect-square bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                {getFileIcon(material.fileType)}
                <span className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">{material.fileType} Dosyası</span>
              </div>
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
                <div className="flex items-center gap-2"><Eye size={18} className="text-slate-400"/> {material.viewCount + 1} Görüntülenme</div>
                <div className="flex items-center gap-2"><Download size={18} className="text-slate-400"/> {material.downloadCount} İndirme</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {/* İNDİRME İŞLEMİ: Güvenli Proxy Rotasına Yönlendirilir */}
                <a 
                  href={`/api/download?id=${material.id}`}
                  className="flex-1 flex justify-center items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Download size={24} /> Dosyayı İndir
                </a>
                <button className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-6 py-4 rounded-2xl font-bold transition-colors border border-slate-200">
                  <Share2 size={20} /> Paylaş
                </button>
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
// İLGİLİ MATERYALLER BİLEŞENİ (Sadece Sunucuda Çalışır)
// -------------------------------------------------------------
async function RelatedMaterials({ category, currentId }: { category: string, currentId: string }) {
  const related = await prisma.material.findMany({
    where: { 
      status: FileStatus.APPROVED,
      category: category as any,
      id: { not: currentId } // Mevcut materyali gizle
    },
    orderBy: { downloadCount: "desc" }, // En çok indirilenleri öner
    take: 3,
  });

  if (related.length === 0) {
    return <p className="text-slate-500">Bu kategoride henüz başka bir materyal bulunmuyor.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {related.map((item) => (
        <MaterialCard key={item.id} material={item} />
      ))}
    </div>
  );
}