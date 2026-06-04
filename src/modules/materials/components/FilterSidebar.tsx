"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { GradeLevel, ContentCategory } from "@prisma/client";
import { SlidersHorizontal, X } from "lucide-react";

// Enum etiketlerini okunabilir yapalım
const FILTERS = {
  grade: [
    { key: GradeLevel.OKUL_ONCESI, label: "Okul Öncesi" },
    { key: GradeLevel.SINIF_1, label: "1. Sınıf" },
    { key: GradeLevel.SINIF_2, label: "2. Sınıf" },
    { key: GradeLevel.SINIF_3, label: "3. Sınıf" },
    { key: GradeLevel.SINIF_4, label: "4. Sınıf" },
    { key: GradeLevel.GENEL, label: "Genel" },
  ],
  category: [
    { key: ContentCategory.ETKINLIK, label: "Sınıf Etkinlikleri" },
    { key: ContentCategory.ODEV, label: "Ödevler" },
    { key: ContentCategory.KONU_ANLATIMI, label: "Konu Anlatımı" },
    { key: ContentCategory.KODLAMA, label: "Kodlama" },
    { key: ContentCategory.INTERAKTIF_OYUN, label: "İnteraktif Oyun" },
    { key: ContentCategory.DEGERLER_EGITIMI, label: "Değerler Eğitimi" },
    { key: ContentCategory.BELIRLI_GUN_VE_HAFTALAR, label: "Belirli Gün ve Haftalar" },
  ]
};

export default function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentGrade = searchParams.get("grade");
  const currentCategory = searchParams.get("category");

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Filtre değiştiğinde 1. sayfaya dön
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const SidebarContent = () => (
    <div className="space-y-8">
      {/* Sınıf Seviyesi */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-900">Sınıf Seviyesi</h3>
          {currentGrade && (
            <button onClick={() => updateFilter("grade", null)} className="text-xs text-rose-500 hover:underline">Temizle</button>
          )}
        </div>
        <div className="space-y-2">
          {FILTERS.grade.map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="grade"
                checked={currentGrade === item.key}
                onChange={() => updateFilter("grade", item.key)}
                className="w-4 h-4 text-sky-500 border-slate-300 focus:ring-sky-500 cursor-pointer"
              />
              <span className={`text-sm ${currentGrade === item.key ? "text-sky-700 font-semibold" : "text-slate-600 group-hover:text-slate-900"}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Kategori */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-900">Kategori</h3>
          {currentCategory && (
            <button onClick={() => updateFilter("category", null)} className="text-xs text-rose-500 hover:underline">Temizle</button>
          )}
        </div>
        <div className="space-y-2">
          {FILTERS.category.map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={currentCategory === item.key}
                onChange={() => updateFilter("category", item.key)}
                className="w-4 h-4 text-sky-500 border-slate-300 rounded focus:ring-sky-500 cursor-pointer"
              />
              <span className={`text-sm ${currentCategory === item.key ? "text-sky-700 font-semibold" : "text-slate-600 group-hover:text-slate-900"}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobil Filtre Butonu */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-3 rounded-2xl font-semibold mb-6 shadow-sm"
      >
        <SlidersHorizontal size={18} /> Filtrele ve Sırala
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm sticky top-24">
        <SidebarContent />
      </div>

      {/* Mobile Drawer (Overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-col bg-white overflow-y-auto pb-12 shadow-2xl h-full transform transition-transform ml-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Filtreler</h2>
              <button onClick={() => setIsMobileOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}