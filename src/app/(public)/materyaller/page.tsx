import { Suspense } from "react";
import type { Metadata } from "next";

import { SearchX } from "lucide-react";

import { MaterialService } from "@/modules/materials/services/material.service";
import { getMaterialsQuerySchema } from "@/modules/materials/schemas/material.schema";

import { formatSubject } from "@/shared/constants/curriculum";

import MaterialCard from "@/modules/materials/components/MaterialCard";
import FilterSidebar from "@/modules/materials/components/FilterSidebar";
import MaterialSearch from "@/modules/materials/components/MaterialSearch";
import SubjectFilterBar from "@/modules/materials/components/SubjectFilterBar";
import Pagination from "@/modules/materials/components/Pagination";

import FavoritesLink from "@/modules/favorites/components/FavoritesLink";

import SkeletonCard from "@/shared/ui/Skeleton";

interface MaterialsSearchParams {
  [key: string]: string | undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<MaterialsSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;

  let titleStr = "Eğitim Materyalleri ve Etkinlikler";

  if (params.grade) {
    titleStr = params.grade.replace("_", " ").replace("SINIF", "Sınıf");

    if (params.subject && params.subject !== "TUM_DERSLER") {
      titleStr += ` ${formatSubject(params.subject)}`;
    }

    titleStr += " Materyalleri";
  }

  if (params.search) {
    titleStr = `"${params.search}" Arama Sonuçları`;
  }

  return {
    /*
     * Root layout template zaten
     * " | Büşra Öğretmen" ekliyor.
     */
    title: titleStr,

    description:
      "Sınıf seviyesine ve derslere göre filtrelenebilir ücretsiz öğretmen materyalleri.",
  };
}

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<MaterialsSearchParams>;
}) {
  const params = await searchParams;

  const parsedParams = getMaterialsQuerySchema.parse(params);

  const suspenseKey = [
    parsedParams.search ?? "",
    parsedParams.grade ?? "",
    parsedParams.subject ?? "",
    parsedParams.category ?? "",
    parsedParams.page,
  ].join("-");

  return (
    <div className="flex flex-col items-start gap-8 pb-12 md:flex-row">
      <FilterSidebar />

      <main className="w-full min-w-0 flex-1">
        <header className="mb-4 space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Eğitim Materyalleri
              </h1>

              <p className="mt-2 text-slate-500">
                Sınıfınıza en uygun içerikleri arayın ve filtreleyin.
              </p>
            </div>

            <div>
              <FavoritesLink />
            </div>
          </div>

          <MaterialSearch />
        </header>

        <SubjectFilterBar />

        <Suspense
          key={suspenseKey}
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
          <MaterialList parsedParams={parsedParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function MaterialList({
  parsedParams,
}: {
  parsedParams: ReturnType<typeof getMaterialsQuerySchema.parse>;
}) {
  const { items, totalPages, page } =
    await MaterialService.getMaterials(parsedParams);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-16 text-center shadow-sm">
        <div className="mb-4 rounded-full bg-slate-50 p-6 text-slate-400">
          <SearchX size={48} />
        </div>

        <h3 className="mb-2 text-2xl font-bold text-slate-900">
          Eşleşen Sonuç Bulunamadı
        </h3>

        <p className="max-w-md text-slate-500">
          Arama kriterlerinize uygun etkinlik sistemde yok. Filtreleri
          temizleyerek yeniden aramayı deneyin.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </div>

      <Pagination totalPages={totalPages} currentPage={page} />
    </>
  );
}
