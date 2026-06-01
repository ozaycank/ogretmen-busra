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
        
        {/* İstatistik Sayaç Paneli (Değiştirilmedi) */}
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

        {/* Kurumsal Alan ve Linkler (Yeni Sütunlu Grid Tasarımı) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-slate-800 pt-10">
          
          {/* Marka ve Açıklama */}
          <div className="md:col-span-12 lg:col-span-6">
            <p className="text-xl font-bold text-white">Büşra Öğretmen</p>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed max-w-sm">
              Türkiye'nin dört bir yanındaki öğretmenler, öğrenciler ve veliler için 
              ücretsiz, güvenilir ve nitelikli eğitim materyalleri deposu.
            </p>
          </div>
          
          {/* Kurumsal Linkler */}
          <div className="md:col-span-6 lg:col-span-3">
            <h3 className="text-white font-bold mb-4 tracking-wide text-sm uppercase">Platform</h3>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><Link href="/hakkimizda" className="hover:text-sky-400 transition-colors">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="hover:text-sky-400 transition-colors">İletişim</Link></li>
              <li><Link href="/materyaller" className="hover:text-sky-400 transition-colors">Tüm Materyaller</Link></li>
              <li><Link href="/haberler" className="hover:text-sky-400 transition-colors">Eğitim Haberleri</Link></li>
            </ul>
          </div>

          {/* Yasal Linkler */}
          <div className="md:col-span-6 lg:col-span-3">
            <h3 className="text-white font-bold mb-4 tracking-wide text-sm uppercase">Yasal</h3>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><Link href="/kullanim-kosullari" className="hover:text-sky-400 transition-colors">Kullanım Koşulları</Link></li>
              <li><Link href="/gizlilik" className="hover:text-sky-400 transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/kvkk-aydinlatma-metni" className="hover:text-sky-400 transition-colors">KVKK Aydınlatma Metni</Link></li>
              <li><Link href="/cerezler" className="hover:text-sky-400 transition-colors">Çerez Tercihleri</Link></li>
            </ul>
          </div>

        </div>

        <div className="text-center md:text-left text-xs text-slate-500 mt-12 pt-6 border-t border-slate-800">
          &copy; {new Date().getFullYear()} busraogretmen.com. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}