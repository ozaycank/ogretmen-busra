import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Search } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-8 md:p-16 overflow-hidden shadow-2xl mt-4">
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-rose-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-sky-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
          <Sparkles size={16} className="text-amber-400" />
          <span>Binlerce ücretsiz eğitim materyali</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
          Eğitimi Eğlenceli <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-rose-400">
            Hale Getiriyoruz
          </span>
        </h1>
        <p className="text-lg text-slate-300 mb-10 max-w-xl">
          Sınıfınıza enerji katacak etkinlikler, ödevler ve konu anlatımları.
          Hemen aramaya başlayın veya kendi içeriklerinizi ekleyin.
        </p>

        {/* Zero-JS Search Form */}
        <form action="/materyaller" method="GET" className="relative max-w-xl flex items-center mb-8">
          <Search className="absolute left-4 text-slate-400" size={20} />
          <input
            type="text"
            name="search"
            required
            placeholder="Ne aramıştınız? (Örn: 1. sınıf okuma yazma)"
            className="w-full pl-12 pr-32 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white/20 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-full font-bold transition-colors"
          >
            Ara
          </button>
        </form>

        <div className="flex gap-4">
          <Link href="/materyaller" className="text-sm font-semibold text-white/80 hover:text-white flex items-center gap-1 transition-colors">
            Tümünü Keşfet <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}