import React from "react";
import { Metadata } from "next";
import { prisma } from "@/infrastructure/database/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Download, Eye, Award, ArrowLeft, Calendar } from "lucide-react";

interface YazarPageProps {
  params: Promise<{ yazarAdi: string }>;
}

export async function generateMetadata({ params }: YazarPageProps): Promise<Metadata> {
  const { yazarAdi } = await params;
  const decodedName = decodeURIComponent(yazarAdi);
  
  return {
    title: `${decodedName} | Eğitim Materyalleri`,
    description: `${decodedName} tarafından Büşra Öğretmen platformunda paylaşılan tüm ücretsiz eğitim materyalleri ve etkinlikler.`,
  };
}

export default async function YazarProfilePage({ params }: YazarPageProps) {
  const { yazarAdi } = await params;
  const decodedName = decodeURIComponent(yazarAdi);

  // 1. Yazarın İstatistiklerini Çek (Sadece ONAYLI materyaller)
  const authorStats = await prisma.material.aggregate({
    _count: { id: true },
    _sum: { downloadCount: true, viewCount: true },
    where: { authorName: decodedName, status: "APPROVED" }
  });

  // Eğer bu yazarın onaylı hiçbir materyali yoksa 404'e at
  if (authorStats._count.id === 0) {
    notFound();
  }

  // 2. Yazarın Materyallerini Çek
  const materials = await prisma.material.findMany({
    where: { authorName: decodedName, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, grade: true, category: true, 
      fileType: true, fileSize: true, downloadCount: true, createdAt: true
    }
  });

  // Yazarın Başarı Seviyesi (Basit bir oyunlaştırma/gamification algoritması)
  const totalDownloads = authorStats._sum.downloadCount || 0;
  let authorBadge = { label: "Yeni Katılımcı", color: "bg-slate-100 text-slate-600" };
  if (totalDownloads > 1000) authorBadge = { label: "Eğitim Elçisi", color: "bg-emerald-100 text-emerald-700" };
  else if (totalDownloads > 500) authorBadge = { label: "Süper Yazar", color: "bg-sky-100 text-sky-700" };
  else if (totalDownloads > 100) authorBadge = { label: "Gelişen Yazar", color: "bg-indigo-100 text-indigo-700" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Üst Kısım: Yazar Banner / Header */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden">
        {/* Dekoratif Arka Plan */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <Link href="/materyaller" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-600 mb-8 relative z-10 transition-colors">
          <ArrowLeft size={16} /> Tüm Materyallere Dön
        </Link>

        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center text-4xl sm:text-5xl font-black shadow-lg shrink-0">
            {decodedName.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{decodedName}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border border-white/20 ${authorBadge.color} flex items-center gap-1 shadow-sm`}>
                  <Award size={14} /> {authorBadge.label}
                </span>
              </div>
              <p className="text-slate-500">Bu içerik üreticisi, platforma sunduğu materyallerle eğitime destek vermektedir.</p>
            </div>

            {/* İstatistikler */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-lg"><FileText size={20} /></div>
                <div><p className="text-xl font-black text-slate-900">{authorStats._count.id}</p><p className="text-xs font-bold text-slate-500 uppercase">Materyal</p></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Download size={20} /></div>
                <div><p className="text-xl font-black text-slate-900">{totalDownloads}</p><p className="text-xs font-bold text-slate-500 uppercase">İndirilme</p></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Eye size={20} /></div>
                <div><p className="text-xl font-black text-slate-900">{authorStats._sum.viewCount || 0}</p><p className="text-xs font-bold text-slate-500 uppercase">Görüntülenme</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alt Kısım: Yazarın Materyalleri Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          Paylaştığı Materyaller
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {materials.map((item) => (
            <Link key={item.id} href={`/materyaller/${item.id}`} className="group bg-white border border-slate-200 rounded-3xl p-5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/5 transition-all flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                  {item.grade.replace("_", " ")}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.fileType}</span>
              </div>
              
              <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
                {item.title}
              </h3>
              
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Calendar size={14}/> {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                  <Download size={14}/> {item.downloadCount}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}