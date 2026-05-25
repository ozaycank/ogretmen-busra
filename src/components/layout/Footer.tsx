"use client";

import React from "react";
import Link from "next/link";
import { Users, Calendar, Activity, Database } from "lucide-react";

// Mock veya API'den gelecek SiteStats şema verisi prototipi
const initialStats = {
  online: 42,
  today: 1240,
  yesterday: 3560,
  total: 1263430,
};

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-gray-300 pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Taslak Görsel 3: İstatistik Sayaç Paneli */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#1e293b] p-6 rounded-2xl border border-slate-800 mb-10 shadow-lg">
          <div className="flex items-center gap-3 justify-center md:justify-start border-r border-slate-800 last:border-0">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">{initialStats.online}</p>
              <p className="text-xs text-slate-400 font-medium">Çevrimiçi</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start md:border-r border-slate-800 last:border-0">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">{initialStats.today}</p>
              <p className="text-xs text-slate-400 font-medium">Bugün</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start border-r border-slate-800 last:border-0">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">{initialStats.yesterday}</p>
              <p className="text-xs text-slate-400 font-medium">Dün</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start last:border-0">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
              <Database size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">{initialStats.total.toLocaleString("tr-TR")}</p>
              <p className="text-xs text-slate-400 font-medium">Toplam Ziyaret</p>
            </div>
          </div>
        </div>

        {/* Kurumsal Alan ve Linkler */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-slate-800 pt-8 gap-6">
          <div>
            <p className="text-lg font-bold text-white">Büşra Öğretmen</p>
            <p className="text-xs text-slate-400 mt-1">Öğretmenler ve veliler için eğlenceli eğitim materyalleri deposu.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link>
            <Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link>
            <Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
            <Link href="/cerezler" className="hover:text-white transition-colors">Çerez Tercihleri</Link>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 mt-8">
          &copy; {new Date().getFullYear()} busra-ogretmen.com. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}