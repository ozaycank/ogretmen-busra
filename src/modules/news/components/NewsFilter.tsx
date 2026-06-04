"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

const LABELS = ["TÜMÜ", "MEB", "ATAMA", "GÜNDEM", "MAAŞ", "DUYURU"];

export default function NewsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentLabel = searchParams.get("label") || "TÜMÜ";
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Debounced Search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set("search", searchTerm);
        params.set("page", "1");
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, pathname, router, searchParams]);

  const updateLabel = (label: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (label === "TÜMÜ") {
      params.delete("label");
    } else {
      params.set("label", label);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
      
      {/* Kategori Sekmeleri */}
      <div className="flex flex-wrap items-center gap-2">
        {LABELS.map((label) => (
          <button
            key={label}
            onClick={() => updateLabel(label)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              currentLabel === label || (!searchParams.has("label") && label === "TÜMÜ")
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Arama Çubuğu */}
      <div className="relative w-full md:w-72 flex-shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Haberlerde ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
        />
      </div>
    </div>
  );
}