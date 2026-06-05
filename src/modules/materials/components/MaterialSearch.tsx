"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

export default function MaterialSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // URL'deki mevcut aramayı canlı olarak takip et
  const currentUrlSearch = searchParams.get("search") || "";
  
  // Yerel input state'i
  const [searchTerm, setSearchTerm] = useState(currentUrlSearch);

  // 1. SENKRONİZASYON: Dışarıdan (örn: Navbar'dan) arama yapılıp URL değişirse, input'un içini de hemen o kelimeyle doldur.
  useEffect(() => {
    setSearchTerm(currentUrlSearch);
  }, [currentUrlSearch]);

  // 2. KULLANICI ETKİLEŞİMİ: Sadece bu inputa yazı yazıldığında URL'i (500ms gecikmeli) güncelle.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // KRİTİK ÇÖZÜM: Eğer inputtaki değer ile URL'deki değer zaten aynıysa, 
      // router.push işlemini iptal et. Bu sayede Navbar araması ezilmez.
      if (searchTerm === currentUrlSearch) return;

      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set("search", searchTerm);
        params.set("page", "1"); // Yeni arama yapıldığında her zaman 1. sayfaya dön
      } else {
        params.delete("search");
      }
      
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentUrlSearch, pathname, router, searchParams]);

  return (
    <div className="relative w-full max-w-2xl">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        placeholder="Etkinlik, konu veya anahtar kelime ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-10 text-slate-900 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all sm:text-sm"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}