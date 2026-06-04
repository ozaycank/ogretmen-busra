import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Cookie } from "lucide-react";
import CookieDashboard from "@/modules/settings/components/CookieDashboard";
export const metadata: Metadata = {
  title: "Çerez Tercihleri | Büşra Öğretmen",
  description: "Büşra Öğretmen platformunda kullanılan çerezleri ve izleme teknolojilerini yönetin.",
};

export default function CookiePreferencesPage() {
  return (
    <div className="max-w-5xl mx-auto pb-16 pt-8 px-4 sm:px-6 lg:px-8">
      
      <header className="mb-10">
        <nav className="flex items-center text-sm font-medium text-slate-500 mb-6">
          <Link href="/" className="hover:text-sky-600 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={16} className="mx-2" />
          <Link href="/gizlilik" className="hover:text-sky-600 transition-colors">Gizlilik Politikası</Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-slate-900">Çerez Tercihleri</span>
        </nav>

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-sm font-bold mb-4">
            <Cookie size={16} />
            <span>Tercih Yönetim Merkezi</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Çerez İzinleri</h1>
          <p className="text-slate-500 mt-4 text-lg leading-relaxed">
            Platform deneyiminizi geliştirmek için hangi verilerin kullanılabileceğine siz karar verin. 
            Veri şeffaflığı ve kontrol tamamen sizin elinizde.
          </p>
        </div>
      </header>

      <CookieDashboard />

    </div>
  );
}