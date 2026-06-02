import React from "react";
import Link from "next/link";
import { Search, Home, BookOpen, Newspaper, Mail, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16">
      
      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Görsel Odak Noktası */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-sky-100 rounded-full animate-pulse opacity-50"></div>
          <div className="absolute inset-2 bg-sky-50 rounded-full"></div>
          <MapPin size={48} className="text-sky-500 relative z-10" />
          <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 text-sm font-black text-slate-800">
            404
          </div>
        </div>

        {/* Metin İçeriği */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Yolumuzu Kaybettik Galiba
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
            Aradığınız eğitim materyali, etkinlik veya sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir. Ama merak etmeyin, kütüphanemizde keşfedilecek daha binlerce içerik var!
          </p>
        </div>

        {/* Hızlı Arama Formu (Server-Side Form) */}
        <form action="/materyaller" method="GET" className="relative max-w-xl mx-auto group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-sky-500 transition-colors" size={22} />
          </div>
          <input 
            type="text" 
            name="q" 
            placeholder="Farklı bir materyal, sınıf veya konu arayın..." 
            className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-24 text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all shadow-sm text-base placeholder:text-slate-400"
            autoFocus
          />
          <button 
            type="submit" 
            className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-6 rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Ara
          </button>
        </form>

        <div className="pt-8 mt-8 border-t border-slate-100">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Hızlı Bağlantılar</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/" 
              className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-sky-200 hover:bg-sky-50 hover:shadow-sm transition-all group"
            >
              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                <Home size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700">Ana Sayfa</span>
            </Link>

            <Link 
              href="/materyaller" 
              className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm transition-all group"
            >
              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                <BookOpen size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700">Tüm Materyaller</span>
            </Link>

            <Link 
              href="/haberler" 
              className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm transition-all group"
            >
              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <Newspaper size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700">Eğitim Haberleri</span>
            </Link>

            <Link 
              href="/iletisim" 
              className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-rose-200 hover:bg-rose-50 hover:shadow-sm transition-all group"
            >
              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                <Mail size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700">İletişim</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}