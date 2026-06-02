import { Suspense } from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { FileStatus, GradeLevel, ContentCategory, Prisma } from "@prisma/client";
import MaterialCard from "@/components/features/MaterialCard";
import FilterSidebar from "@/components/features/materials/FilterSidebar";
import MaterialSearch from "@/components/features/materials/MaterialSearch";
import Pagination from "@/components/features/materials/Pagination";
import SkeletonCard from "@/components/ui/Skeleton";
import { SearchX } from "lucide-react";
import FavoritesLink from "@/components/features/favorites/FavoritesLink";

// Dinamik SEO Metadata
export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams;
  const searchQuery = params.search ? `"${params.search}" Arama Sonuçları` : "Eğitim Materyalleri ve Etkinlikler";
  return {
    title: `${searchQuery} | Büşra Öğretmen`,
    description: "Sınıf seviyesine ve derslere göre filtrelenebilir ücretsiz öğretmen materyalleri.",
  };
}

const ITEMS_PER_PAGE = 12;

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const grade = params.grade as GradeLevel | undefined;
  const category = params.category as ContentCategory | undefined;
  const currentPage = Number(params.page) || 1;

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start pb-12">
      <FilterSidebar />

      <main className="flex-1 w-full min-w-0">
        <header className="mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Eğitim Materyalleri
              </h1>
              <p className="text-slate-500 mt-2">
                Sınıfınıza en uygun içerikleri arayın ve filtreleyin.
              </p>
            </div>
            
            {/* Dinamik Favoriler Butonumuz */}
            <div>
              <FavoritesLink />
            </div>
          </div>
          <MaterialSearch />
        </header>

        {/* Suspense ile veritabanı sorgusu sürerken iskelet gösteriyoruz */}
        <Suspense key={`${search}-${grade}-${category}-${currentPage}`} fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        }>
          <MaterialList search={search} grade={grade} category={category} page={currentPage} />
        </Suspense>
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// VERİTABANI SORGULAMA BİLEŞENİ
// -------------------------------------------------------------
async function MaterialList({ 
  search, grade, category, page 
}: { 
  search: string, grade?: GradeLevel, category?: ContentCategory, page: number 
}) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Dinamik Prisma Sorgusu Oluşturma
  const whereClause: Prisma.MaterialWhereInput = {
    status: FileStatus.APPROVED,
  };

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  
  if (grade) whereClause.grade = grade;
  if (category) whereClause.category = category;

  // Paralel olarak hem datayı hem toplam sayıyı çekiyoruz (Performans için Promise.all)
  const [materials, totalCount] = await Promise.all([
    prisma.material.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip: skip,
    }),
    prisma.material.count({ where: whereClause })
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
        <div className="bg-slate-50 p-6 rounded-full text-slate-400 mb-4">
          <SearchX size={48} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Eşleşen Sonuç Bulunamadı</h3>
        <p className="text-slate-500 max-w-md">
          Arama kriterlerinize uygun etkinlik sistemde yok. Filtreleri temizleyerek yeniden aramayı deneyin.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </div>
      
      <Pagination totalPages={totalPages} currentPage={page} />
    </>
  );
}