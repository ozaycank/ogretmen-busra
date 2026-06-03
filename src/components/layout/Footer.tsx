import React from "react";
import Link from "next/link";
import { Users, Calendar, Activity, Database } from "lucide-react";
import { AnalyticsService } from "@/services/analytics.service";

// Next.js Cache Revalidation: Bu bileşen en fazla 60 saniyede bir güncellenir.
// Böylece yüksek trafikte Redis/DB sunucumuz çökmez.
export const revalidate = 60; 

export default async function Footer() {
  // Gerçek verileri çekiyoruz
  const stats = await AnalyticsService.getGlobalStats();

  return (
    <footer className="bg-[#0f172a] text-gray-300 pt-12 pb-6 mt-auto border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* GERÇEK ZAMANLI İSTATİSTİK SAYACI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#1e293b] p-6 rounded-2xl border border-slate-800 mb-10 shadow-lg relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl" />

          <div className="flex items-center gap-3 justify-center md:justify-start border-r border-slate-800/50 last:border-0 relative z-10">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl relative">
              <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">{stats.online.toLocaleString("tr-TR")}</p>
              <p className="text-xs text-slate-400 font-medium">Çevrimiçi</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start md:border-r border-slate-800/50 last:border-0 relative z-10">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">{stats.today.toLocaleString("tr-TR")}</p>
              <p className="text-xs text-slate-400 font-medium">Bugün</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start border-r border-slate-800/50 last:border-0 relative z-10">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">{stats.yesterday.toLocaleString("tr-TR")}</p>
              <p className="text-xs text-slate-400 font-medium">Dün</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start last:border-0 relative z-10">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
              <Database size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">{stats.total.toLocaleString("tr-TR")}</p>
              <p className="text-xs text-slate-400 font-medium">Toplam Ziyaret</p>
            </div>
          </div>
        </div>

        {/* Kurumsal Alan ve Linkler */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-slate-800/50 pt-10">
          
          <div className="md:col-span-12 lg:col-span-6">
            <p className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-rose-500 flex items-center justify-center text-sm font-black text-white">BÖ</span>
              Büşra Öğretmen
            </p>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed max-w-sm">
              Türkiye'nin dört bir yanındaki öğretmenler, öğrenciler ve veliler için ücretsiz, güvenilir ve nitelikli eğitim materyalleri deposu.
            </p>
          </div>
          
          <div className="md:col-span-6 lg:col-span-3">
            <h3 className="text-white font-bold mb-4 tracking-wide text-sm uppercase">Platform</h3>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><Link href="/hakkimizda" className="hover:text-sky-400 transition-colors">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="hover:text-sky-400 transition-colors">İletişim</Link></li>
              <li><Link href="/materyaller" className="hover:text-sky-400 transition-colors">Tüm Materyaller</Link></li>
              <li><Link href="/haberler" className="hover:text-sky-400 transition-colors">Eğitim Haberleri</Link></li>
            </ul>
          </div>

          <div className="md:col-span-6 lg:col-span-3">
            <h3 className="text-white font-bold mb-4 tracking-wide text-sm uppercase">Yasal</h3>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><Link href="/kullanim-kosullari" className="hover:text-sky-400 transition-colors">Kullanım Koşulları</Link></li>
              <li><Link href="/gizlilik" className="hover:text-sky-400 transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/kvkk-aydinlatma-metni" className="hover:text-sky-400 transition-colors">KVKK</Link></li>
              <li><Link href="/cerezler" className="hover:text-sky-400 transition-colors">Çerez Tercihleri</Link></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 mt-12 pt-6 border-t border-slate-800/50">
          <p>&copy; {new Date().getFullYear()} ogretmenbusra.com. Tüm hakları saklıdır.</p>
          <p className="mt-2 md:mt-0 font-medium">Developed with ❤️ for Education</p>
        </div>
      </div>
    </footer>
  );
}