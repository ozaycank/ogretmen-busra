import { Suspense } from "react";
import { Metadata } from "next";
import { MaterialService } from "@/modules/materials/services/material.service";
import { getMaterialsQuerySchema } from "@/modules/materials/schemas/material.schema";
import MaterialCard from "@/modules/materials/components/MaterialCard";

import FilterSidebar from "@/modules/materials/components/FilterSidebar";
import MaterialSearch from "@/modules/materials/components/MaterialSearch";
import Pagination from "@/modules/materials/components/Pagination";
import SkeletonCard from "@/shared/ui/Skeleton";
import { SearchX } from "lucide-react";
import FavoritesLink from "@/modules/favorites/components/FavoritesLink";

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams;
  const searchQuery = params.search ? `"${params.search}" Arama Sonuçları` : "Eğitim Materyalleri ve Etkinlikler";
  return {
    title: `${searchQuery} | Büşra Öğretmen`,
    description: "Sınıf seviyesine ve derslere göre filtrelenebilir ücretsiz öğretmen materyalleri.",
  };
}

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  
  //URL'den gelen string verileri Zod ile güvenli hale getiriyoruz
  const parsedParams = getMaterialsQuerySchema.parse(params);

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
            
            <div>
              <FavoritesLink />
            </div>
          </div>
          <MaterialSearch />
        </header>

        <Suspense key={`${parsedParams.search}-${parsedParams.grade}-${parsedParams.category}-${parsedParams.page}`} fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        }>
          <MaterialList parsedParams={parsedParams} />
        </Suspense>
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// VERİTABANI SORGULAMA BİLEŞENİ
// -------------------------------------------------------------
async function MaterialList({ parsedParams }: { parsedParams: any }) {
  // Doğrudan Prisma kullanımı kaldırıldı. Service Layer çağrılıyor.
  const { items, totalPages, page } = await MaterialService.getMaterials(parsedParams);

  if (items.length === 0) {
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
        {items.map((material) => (
          <MaterialCard key={material.id} material={material as any} />
        ))}
      </div>
      
      <Pagination totalPages={totalPages} currentPage={page} />
    </>
  );
}