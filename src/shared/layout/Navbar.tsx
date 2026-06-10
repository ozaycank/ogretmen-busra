"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, ChevronDown, GraduationCap, FileText, Newspaper } from "lucide-react";
import { useRouter } from "next/navigation";

const GRADE_LEVELS = [
  { key: "OKUL_ONCESI", label: "Okul Öncesi" },
  { key: "SINIF_1", label: "1. Sınıf" },
  { key: "SINIF_2", label: "2. Sınıf" },
  { key: "SINIF_3", label: "3. Sınıf" },
  { key: "SINIF_4", label: "4. Sınıf" },
  { key: "GENEL", label: "Genel" },
];

const SearchBar = ({ className = "" }: { className?: string }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/materyaller?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`} role="search">
      <label htmlFor="searchInput" className="sr-only">Etkinlik Ara</label>
      <input
        id="searchInput"
        type="text"
        placeholder="Etkinlik, ödev veya döküman ara..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all"
      />
      <button 
        type="submit" 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0284c7]"
        aria-label="Arama yap"
      >
        <Search size={18} />
      </button>
    </form>
  );
};

const ClassesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef} onBlur={handleBlur}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1 text-gray-600 hover:text-[#0284c7] font-medium text-sm transition-colors"
      >
        Sınıflar <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div 
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 grid grid-cols-1 gap-1"
        >
          {GRADE_LEVELS.map((grade) => (
            <Link
              key={grade.key}
              href={`/materyaller?grade=${grade.key}`}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0284c7] transition-colors"
            >
              <GraduationCap size={16} className="text-gray-400" />
              {grade.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm" aria-label="Ana navigasyon">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2" aria-label="Ana Sayfaya Dön">
              <Image 
                src="/ogretmenbusraicon.png" 
                alt="Öğretmen Büşra" 
                width={40} 
                height={40} 
                className="w-10 h-10 object-contain mix-blend-multiply" 
                priority 
              />
              <div className="flex items-center">
                <span className="text-2xl font-black tracking-tight text-[#e11d48]">Büşra</span>
                <span className="text-2xl font-bold text-[#0284c7]">Öğretmen</span>
              </div>
            </Link>
          </div>

          <SearchBar className="hidden md:flex flex-1 max-w-md mx-8" />

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-[#0284c7] font-medium text-sm transition-colors">
              Ana Sayfa
            </Link>

            <ClassesDropdown />

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

          <div className="flex md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-gray-600 focus:outline-none p-2"
              aria-expanded={isMobileMenuOpen}
              aria-label="Mobil menüyü aç/kapat"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-6 space-y-3 shadow-inner">
          <SearchBar className="w-full my-2" />

          <Link 
            href="/" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
          >
            Ana Sayfa
          </Link>
          <Link 
            href="/haberler" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
          >
            Eğitim Haberleri
          </Link>
          
          <div className="border-t border-gray-100 pt-2">
            <span className="block px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Sınıflar</span>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {GRADE_LEVELS.map((grade) => (
                <Link
                  key={grade.key}
                  href={`/materyaller?grade=${grade.key}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  {grade.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/materyal-ekle"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-center bg-[#e11d48] text-white px-4 py-3 rounded-xl font-semibold text-sm"
          >
            Etkinlik Paylaş
          </Link>
        </div>
      )}
    </nav>
  );
}