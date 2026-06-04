import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/infrastructure/database/prisma";
import { ChevronRight, Calendar, Eye, Clock, Share2 } from "lucide-react";
import NewsCard from "@/modules/news/components/NewsCard";

import SkeletonCard from "@/shared/ui/Skeleton";
// Okuma süresi hesaplama fonksiyonu
function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 200) || 1;
}

// 1. Dinamik SEO ve OpenGraph
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id } });

  if (!news) return { title: "Haber Bulunamadı" };

  return {
    title: `${news.title} | Büşra Öğretmen`,
    description: news.content.substring(0, 160) + "...",
    openGraph: {
      title: news.title,
      description: news.content.substring(0, 160) + "...",
      type: "article",
      publishedTime: news.createdAt.toISOString(),
      images: news.imageUrl ? [{ url: news.imageUrl }] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Haberi Çek
  const news = await prisma.news.findUnique({
    where: { id },
  });

  if (!news) notFound();

  // Arka planda görüntülenme sayısını artır (Fire-and-forget)
  prisma.news.update({
    where: { id },
    data: { viewCount: { increment: 1 } }
  }).catch(() => {}); 

  const readingTime = calculateReadingTime(news.content);

  // JSON-LD NewsArticle Şeması
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": news.title,
    "image": news.imageUrl ? [news.imageUrl] : [],
    "datePublished": news.createdAt.toISOString(),
    "dateModified": news.updatedAt.toISOString(),
    "author": [{
        "@type": "Person",
        "name": "Büşra Öğretmen Editör Ekibi",
        "url": "https://ogretmenbusra.com/hakkimizda"
    }]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-4xl mx-auto pb-12 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm font-medium text-slate-500 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-sky-600 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={16} className="mx-2 flex-shrink-0" />
          <Link href="/haberler" className="hover:text-sky-600 transition-colors">Eğitim Gündemi</Link>
          <ChevronRight size={16} className="mx-2 flex-shrink-0" />
          <Link href={`/haberler?label=${news.label}`} className="hover:text-sky-600 transition-colors">{news.label}</Link>
        </nav>

        {/* Haber Başlığı ve Metrikler */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">
              {news.label}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
            {news.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 py-4 border-y border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-slate-400"/>
              {new Date(news.createdAt).toLocaleDateString("tr-TR", { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-slate-400"/>
              {readingTime} Dk Okuma
            </div>
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-slate-400"/>
              {news.viewCount + 1} Okunma
            </div>
          </div>
        </header>

        {/* Görsel Alanı */}
        {news.imageUrl && (
          <figure className="w-full aspect-[21/9] bg-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <img 
              src={news.imageUrl} 
              alt={news.title} 
              className="w-full h-full object-cover"
            />
          </figure>
        )}

        {/* Makale İçeriği (Typography Optimization) */}
        <article className="prose prose-slate prose-lg max-w-none text-slate-700 leading-loose whitespace-pre-wrap">
          {news.content}
        </article>

        {/* Sosyal Paylaşım ve Etiketler (SVG ikonlar kullanıldı) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 mt-12">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Share2 size={20} className="text-slate-500" />
            Haberi Paylaş:
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-white hover:bg-[#1877F2] hover:text-white text-slate-400 rounded-full shadow-sm transition-all">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
            </button>
            <button className="p-3 bg-white hover:bg-[#1DA1F2] hover:text-white text-slate-400 rounded-full shadow-sm transition-all">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </button>
            <button className="p-3 bg-white hover:bg-[#0A66C2] hover:text-white text-slate-400 rounded-full shadow-sm transition-all">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
            </button>
          </div>
        </div>

        {/* İlgili Haberler */}
        <section className="pt-12 border-t border-slate-100">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900">İlgili Haberler</h2>
              <p className="text-slate-500 mt-1">Bu konudaki diğer gelişmelere göz atın.</p>
            </div>
            <Link href="/haberler" className="text-sky-600 font-bold hover:underline hidden sm:block">
              Tümüne Git &rarr;
            </Link>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonCard /><SkeletonCard />
            </div>
          }>
            <RelatedNews label={news.label} currentId={news.id} />
          </Suspense>
        </section>
      </div>
    </>
  );
}

// -------------------------------------------------------------
// İLGİLİ HABERLER BİLEŞENİ
// -------------------------------------------------------------
async function RelatedNews({ label, currentId }: { label: string, currentId: string }) {
  const relatedNews = await prisma.news.findMany({
    where: { 
      label: label,
      id: { not: currentId }
    },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  if (relatedNews.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {relatedNews.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
}