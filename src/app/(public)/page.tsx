import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import HeroSection from "@/modules/home/components/HeroSection";
import CategorySection from "@/modules/home/components/CategorySection";
import LatestMaterials from "@/modules/home/components/LatestMaterials";

import NewsSection from "@/modules/news/components/NewsSection";

import SkeletonCard from "@/shared/ui/Skeleton";

export const metadata: Metadata = {
  title: "Eğlenceli Eğitim Materyalleri ve Etkinlikler",

  description:
    "İlkokul ve okul öncesi öğretmenleri için binlerce ücretsiz etkinlik, ödev, boyama sayfası ve interaktif materyal arşivi.",

  openGraph: {
    title: "Büşra Öğretmen | Ücretsiz Eğitim Materyalleri",

    description: "Sınıfınıza enerji katacak etkinlikleri hemen indirin.",

    url: "https://ogretmenbusra.com",

    siteName: "Büşra Öğretmen",

    images: [
      {
        url: "/images/og-home.jpg",
        width: 1200,
        height: 630,
      },
    ],

    locale: "tr_TR",

    type: "website",
  },
};

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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <div className="space-y-20 pb-10">
        <HeroSection />

        <CategorySection />

        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Hızlı Sınıf Keşfi
          </h2>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/okul-oncesi"
              prefetch={false}
              className="rounded-xl bg-sky-50 px-5 py-2.5 font-bold text-sky-700 hover:bg-sky-100"
            >
              Okul Öncesi Materyalleri
            </Link>

            <Link
              href="/1-sinif"
              prefetch={false}
              className="rounded-xl bg-sky-50 px-5 py-2.5 font-bold text-sky-700 hover:bg-sky-100"
            >
              1. Sınıf Materyalleri
            </Link>

            <Link
              href="/2-sinif"
              prefetch={false}
              className="rounded-xl bg-sky-50 px-5 py-2.5 font-bold text-sky-700 hover:bg-sky-100"
            >
              2. Sınıf Materyalleri
            </Link>

            <Link
              href="/3-sinif"
              prefetch={false}
              className="rounded-xl bg-sky-50 px-5 py-2.5 font-bold text-sky-700 hover:bg-sky-100"
            >
              3. Sınıf Materyalleri
            </Link>

            <Link
              href="/4-sinif"
              prefetch={false}
              className="rounded-xl bg-sky-50 px-5 py-2.5 font-bold text-sky-700 hover:bg-sky-100"
            >
              4. Sınıf Materyalleri
            </Link>

            <Link
              href="/genel-materyaller"
              prefetch={false}
              className="rounded-xl bg-slate-50 px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-100"
            >
              Genel Materyaller
            </Link>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                En Yeni Etkinlikler
              </h2>

              <p className="mt-2 text-slate-500">
                Sisteme yeni eklenen ve editör onayından geçen içerikler.
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({
                  length: 6,
                }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            }
          >
            <LatestMaterials />
          </Suspense>
        </section>

        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                Eğitim Gündemi
              </h2>

              <p className="mt-2 text-slate-500">
                Atamalar, MEB duyuruları ve mesleki gelişmeler.
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Array.from({
                  length: 2,
                }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            }
          >
            <NewsSection />
          </Suspense>
        </section>
      </div>
    </>
  );
}
