import { Suspense } from "react";
import { Metadata } from "next";
import { prisma } from "@/infrastructure/database/prisma";
import NewsFilter from "@/modules/news/components/NewsFilter";

import NewsCard from "@/modules/news/components/NewsCard";

import Pagination from "@/modules/materials/components/Pagination";
import SkeletonCard from "@/shared/ui/Skeleton";
import { Newspaper } from "lucide-react";
import { Prisma } from "@prisma/client";

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams;
  const label = params.label ? `${params.label} Haberleri` : "Eğitim Gündemi ve Haberler";
  return {
    title: `${label} | Büşra Öğretmen`,
    description: "Öğretmen atamaları, MEB duyuruları, maaş zamları ve eğitim dünyasındaki son dakika gelişmeleri.",
  };
}

const ITEMS_PER_PAGE = 10; // 1 Featured + 9 Regular

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const label = params.label || "";
  const currentPage = Number(params.page) || 1;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Eğitim <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-rose-500">Gündemi</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl">
          Eğitim dünyasındaki en son gelişmeleri, MEB duyurularını ve atama haberlerini buradan takip edin.
        </p>
      </header>

      <NewsFilter />

      <Suspense key={`${search}-${label}-${currentPage}`} fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 h-80 bg-slate-200 rounded-3xl animate-pulse" />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      }>
        <NewsList search={search} label={label} page={currentPage} />
      </Suspense>
    </div>
  );
}

// -------------------------------------------------------------
// VERİTABANI SORGULAMA BİLEŞENİ
// -------------------------------------------------------------
async function NewsList({ search, label, page }: { search: string, label: string, page: number }) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const whereClause: Prisma.NewsWhereInput = {};
  if (label && label !== "TÜMÜ") whereClause.label = label;
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const [news, totalCount] = await Promise.all([
    prisma.news.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }, // En yeniler
      take: ITEMS_PER_PAGE,
      skip: skip,
    }),
    prisma.news.count({ where: whereClause })
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
        <div className="bg-slate-50 p-6 rounded-full text-slate-400 mb-4">
          <Newspaper size={48} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Haber Bulunamadı</h3>
        <p className="text-slate-500 max-w-md">
          Arama kriterlerinize veya seçtiğiniz kategoriye ait henüz bir haber yayınlanmamış.
        </p>
      </div>
    );
  }

  // İlk sayfanın ilk haberi "Featured" (Öne Çıkan) olarak büyük gösterilir
  const featuredNews = page === 1 && !search ? news[0] : null;
  const regularNews = featuredNews ? news.slice(1) : news;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredNews && <NewsCard news={featuredNews} featured={true} />}
        {regularNews.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
      
      {totalPages > 1 && <Pagination totalPages={totalPages} currentPage={page} />}
    </>
  );
}