import React from "react";
import Link from "next/link";
import { Calendar, Eye, ArrowRight } from "lucide-react";
import { News } from "@prisma/client";

export default function NewsCard({ news, featured = false }: { news: News, featured?: boolean }) {
  return (
    <article className={`bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col ${featured ? 'md:flex-row col-span-1 md:col-span-2' : ''}`}>
      {/* Görsel Alanı (Görsel yoksa yedek bir gradient gösterilir) */}
      <div className={`relative bg-slate-100 ${featured ? 'w-full md:w-2/5 h-64 md:h-auto' : 'w-full h-48'}`}>
        {news.imageUrl ? (
          <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sky-100 to-rose-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <span className="text-4xl font-black text-slate-200 opacity-50">BÜŞRA ÖĞRETMEN</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-sky-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
            {news.label}
          </span>
        </div>
      </div>

      {/* İçerik Alanı */}
      <div className={`flex flex-col p-6 ${featured ? 'w-full md:w-3/5 justify-center' : 'flex-1'}`}>
        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mb-3">
          <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(news.createdAt).toLocaleDateString("tr-TR")}</span>
          <span className="flex items-center gap-1"><Eye size={14} /> {news.viewCount} Okunma</span>
        </div>
        
        <h3 className={`font-bold text-slate-900 leading-tight mb-3 group-hover:text-sky-600 transition-colors ${featured ? 'text-2xl' : 'text-xl line-clamp-2'}`}>
          {news.title}
        </h3>
        
        <p className={`text-slate-500 text-sm mb-6 ${featured ? 'line-clamp-3' : 'line-clamp-2 flex-1'}`}>
          {news.content}
        </p>

        <Link href={`/haberler/${news.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-sky-500 hover:text-sky-700 mt-auto w-fit">
          Haberi Oku <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}