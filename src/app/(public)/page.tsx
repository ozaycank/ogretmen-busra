import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import HeroSection from "@/modules/home/components/HeroSection";
import CategorySection from "@/modules/home/components/CategorySection";
import LatestMaterials from "@/modules/home/components/LatestMaterials";
import NewsSection from "@/modules/news/components/NewsSection";
import SkeletonCard from "@/shared/ui/Skeleton";

// 1. Gelişmiş SEO ve OpenGraph Meta Verileri
export const metadata: Metadata = {
  // Title template uygulanması için absolute tanımlamıyoruz
  title: "Eğlenceli Eğitim Materyalleri ve Etkinlikler", 
  description: "İlkokul ve okul öncesi öğretmenleri için binlerce ücretsiz etkinlik, ödev, boyama sayfası ve interaktif materyal arşivi.",
  openGraph: {
    title: "Büşra Öğretmen | Ücretsiz Eğitim Materyalleri",
    description: "Sınıfınıza enerji katacak etkinlikleri hemen indirin.",
    url: "https://ogretmenbusra.com",
    siteName: "Büşra Öğretmen",
    images: [{ url: "/images/og-home.jpg", width: 1200, height: 630 }],
    locale: "tr_TR",
    type: "website",
  },
};

// 2. JSON-LD Structured Data (Google Zengin Sonuçlar İçin)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Büşra Öğretmen",
  url: "https://ogretmenbusra.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://ogretmenbusra.com/materyaller?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="space-y-20 pb-10">
        {/* Hero Section (H1 burada yer alıyor) */}
        <HeroSection />
        
        <CategorySection />

        {/* YENİ SEO LİNK AĞI: Ana Sayfadan SEO Sınıf Sayfalarına doğrudan HTML Linki (Crawlability) */}
        <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Hızlı Sınıf Keşfi</h2>
          <div className="flex flex-wrap gap-4">
             <Link href="/okul-oncesi" className="px-5 py-2.5 bg-sky-50 text-sky-700 font-bold rounded-xl hover:bg-sky-100">Okul Öncesi Materyalleri</Link>
             <Link href="/1-sinif" className="px-5 py-2.5 bg-sky-50 text-sky-700 font-bold rounded-xl hover:bg-sky-100">1. Sınıf Materyalleri</Link>
             <Link href="/2-sinif" className="px-5 py-2.5 bg-sky-50 text-sky-700 font-bold rounded-xl hover:bg-sky-100">2. Sınıf Materyalleri</Link>
             <Link href="/3-sinif" className="px-5 py-2.5 bg-sky-50 text-sky-700 font-bold rounded-xl hover:bg-sky-100">3. Sınıf Materyalleri</Link>
             <Link href="/4-sinif" className="px-5 py-2.5 bg-sky-50 text-sky-700 font-bold rounded-xl hover:bg-sky-100">4. Sınıf Materyalleri</Link>
             <Link href="/genel-materyaller" className="px-5 py-2.5 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100">Genel Materyaller</Link>
          </div>
        </section>

        {/* Dinamik Veri 1: En Yeni Materyaller */}
        <section className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">En Yeni Etkinlikler</h2>
              <p className="text-slate-500 mt-2">Sisteme yeni eklenen ve editör onayından geçen içerikler.</p>
            </div>
          </div>
          
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          }>
            <LatestMaterials />
          </Suspense>
        </section>

        {/* Dinamik Veri 2: Eğitim Haberleri */}
        <section className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Eğitim Gündemi</h2>
              <p className="text-slate-500 mt-2">Atamalar, MEB duyuruları ve mesleki gelişmeler.</p>
            </div>
          </div>
          
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          }>
            <NewsSection />
          </Suspense>
        </section>
      </div>
    </>
  );
}