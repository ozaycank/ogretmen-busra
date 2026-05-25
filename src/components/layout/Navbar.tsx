"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, ChevronDown, GraduationCap, FileText, Newspaper } from "lucide-react";
import { useRouter } from "next/navigation";

const router = useRouter();
// Şemadaki GradeLevel yapısının kullanıcı dostu Türkçe karşılıkları
const GRADE_LEVELS = [
  { key: "OKUL_ONCESI", label: "Okul Öncesi" },
  { key: "SINIF_1", label: "1. Sınıf" },
  { key: "SINIF_2", label: "2. Sınıf" },
  { key: "SINIF_3", label: "3. Sınıf" },
  { key: "SINIF_4", label: "4. Sınıf" },
  { key: "GENEL", label: "Genel" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Arama tetikleme mantığı
    router.push(`/materyaller?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm" aria-label="Ana navigasyon" aria-expanded={isDropdownOpen}
aria-haspopup="menu">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo Bölümü */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-[#e11d48]">Büşra</span>
              <span className="text-2xl font-bold text-[#0284c7]">Öğretmen</span>
            </Link>
          </div>

          {/* Arama Çubuğu (Masaüstü) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Etkinlik, ödev veya döküman ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0284c7]">
              <Search size={18} />
            </button>
          </form>

          {/* Menü Linkleri (Masaüstü) */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-[#0284c7] font-medium text-sm transition-colors">
              Ana Sayfa
            </Link>

            {/* Sınıflar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                className="flex items-center gap-1 text-gray-600 hover:text-[#0284c7] font-medium text-sm transition-colors"
              >
                Sınıflar <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 grid grid-cols-1 gap-1">
                  {GRADE_LEVELS.map((grade) => (
                    <Link
                      key={grade.key}
                      href={`/materyaller?grade=${grade.key}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0284c7] transition-colors"
                    >
                      <GraduationCap size={16} className="text-gray-400" />
                      {grade.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/haberler" className="flex items-center gap-1 text-gray-600 hover:text-[#0284c7] font-medium text-sm transition-colors">
              <Newspaper size={16} /> Eğitim Haberleri
            </Link>

            <Link
              href="/materyal-ekle"
              className="bg-[#e11d48] text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-[#be123c] transition-all shadow-sm flex items-center gap-1"
            >
              <FileText size={16} /> Etkinlik Paylaş
            </Link>
          </div>

          {/* Mobil Menü Butonu */}
          <div className="flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Menü İçeriği */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-6 space-y-3 shadow-inner">
          <form onSubmit={handleSearch} className="relative my-2">
            <input
              type="text"
              placeholder="Etkinlik ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </button>
          </form>

          <Link href="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
            Ana Sayfa
          </Link>
          <Link href="/haberler" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
            Eğitim Haberleri
          </Link>
          <div className="border-t border-gray-100 pt-2">
            <span className="block px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Sınıflar</span>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {GRADE_LEVELS.map((grade) => (
                <Link
                  key={grade.key}
                  href={`/materyaller?grade=${grade.key}`}
                  className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  {grade.label}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/materyal-ekle"
            className="block text-center bg-[#e11d48] text-white px-4 py-3 rounded-xl font-semibold text-sm"
          >
            Etkinlik Paylaş
          </Link>
        </div>
      )}
    </nav>
  );
}