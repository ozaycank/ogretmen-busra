import React from "react";

export default function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm animate-pulse flex flex-col gap-4">
      {/* Görsel/Kategori Etiketi Alanı */}
      <div className="w-full h-44 bg-gray-200 rounded-2xl" />

      {/* İçerik Detay Alanı */}
      <div className="flex-1 space-y-3">
        {/* Kategori ve Sınıf Rozetleri Skeletons */}
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
          <div className="h-5 w-24 bg-gray-200 rounded-full" />
        </div>

        {/* Başlık */}
        <div className="h-5 bg-gray-200 rounded-lg w-5/6" />
        
        {/* Açıklama Satırları */}
        <div className="space-y-2">
          <div className="h-3.5 bg-gray-200 rounded-lg w-full" />
          <div className="h-3.5 bg-gray-200 rounded-lg w-2/3" />
        </div>
      </div>

      {/* Alt Metrikler ve İndirme Alanı */}
      <div className="border-t border-gray-50 pt-3 flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded-md w-24" />
        <div className="h-8 bg-gray-200 rounded-full w-20" />
      </div>
    </div>
  );
}