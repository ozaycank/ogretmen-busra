"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { getFavoriteMaterials } from "@/app/(public)/favoriler/actions";
import MaterialCard from "@/components/features/MaterialCard";
import SkeletonCard from "@/components/ui/Skeleton";
import { Heart, Search, BookmarkX, ArrowLeft } from "lucide-react";
import Link from "next/link";

const ITEMS_PER_PAGE = 12;

export default function FavoritesPage() {
  const { favorites, isLoaded } = useFavorites();
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // İstemci tarafı arama ve sayfalama stateleri
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Favoriler değiştiğinde (veya ilk yüklendiğinde) sunucudan verileri çek
  useEffect(() => {
    if (!isLoaded) return;
    
    if (favorites.length === 0) {
      setMaterials([]);
      setIsLoadingData(false);
      return;
    }

    const fetchData = async () => {
      setIsLoadingData(true);
      const data = await getFavoriteMaterials(favorites);
      setMaterials(data);
      setIsLoadingData(false);
    };

    fetchData();
  }, [isLoaded, favorites.length]); // Sadece uzunluk değiştiğinde tetikle (performans)

  // Arama filtresi (Client-Side Search)
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.authorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [materials, searchQuery]);

  // İstemci Tarafı Sayfalama (Client-Side Pagination)
  const totalPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE);
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // Arama yapıldığında sayfayı 1'e sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (!isLoaded || isLoadingData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3"><Heart className="text-rose-500"/> Favorilerim</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[70vh]">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <Link href="/materyaller" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-600 mb-4 transition-colors">
            <ArrowLeft size={16} /> Keşfetmeye Dön
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Heart className="text-rose-500 fill-rose-500" /> Kaydettiğim Materyaller
          </h1>
          <p className="text-slate-500 mt-2">Daha sonra incelemek üzere kaydettiğiniz içerikler burada tutulur.</p>
        </div>

        {materials.length > 0 && (
          <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Favorilerde ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all shadow-sm"
            />
          </div>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
          <div className="bg-slate-50 p-6 rounded-full text-slate-400 mb-4">
            <BookmarkX size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Listeniz Henüz Boş</h3>
          <p className="text-slate-500 max-w-md mb-8">
            İlginizi çeken materyallerin üzerindeki kalp ikonuna tıklayarak onları buraya ekleyebilir ve daha sonra kolayca bulabilirsiniz.
          </p>
          <Link href="/materyaller" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Materyalleri İncele
          </Link>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Aramanızla eşleşen kaydedilmiş materyal bulunamadı.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedMaterials.map((item) => (
              <MaterialCard key={item.id} material={item} />
            ))}
          </div>

          {/* İstemci Tarafı Sayfalama Butonları */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold transition-colors ${currentPage === i + 1 ? "bg-slate-900 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
}