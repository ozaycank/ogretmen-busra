import { Suspense } from "react";
import { Metadata } from "next";
import HeroSection from "@/modules/home/components/HeroSection";
import CategorySection from "@/modules/home/components/CategorySection";
import LatestMaterials from "@/modules/home/components/LatestMaterials";
import NewsSection from "@/modules/news/components/NewsSection";
import SkeletonCard from "@/shared/ui/Skeleton";

// 1. Gelişmiş SEO ve OpenGraph Meta Verileri
export const metadata: Metadata = {
  title: "Büşra Öğretmen | Eğlenceli Eğitim Materyalleri ve Etkinlikler",
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
        {/* Statik alanlar anında render edilir */}
        <HeroSection />
        <CategorySection />

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