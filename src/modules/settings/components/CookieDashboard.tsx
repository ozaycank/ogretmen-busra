"use client";

import React, { useState } from "react";
import { useCookieConsent } from "@/shared/providers/CookieProvider";
import Switch from "@/components/ui/Switch";
import { ShieldAlert, Activity, Settings, Megaphone, CheckCircle2 } from "lucide-react";

export default function CookieDashboard() {
  const { preferences, isLoaded, updatePreferences, acceptAll, rejectAllOptional } = useCookieConsent();
  const [showSuccess, setShowSuccess] = useState(false);

  // Hydration hatasını önlemek için client tarafı yüklenene kadar iskelet gösteriyoruz
  if (!isLoaded) {
    return <div className="h-96 w-full bg-slate-100 rounded-3xl animate-pulse" />;
  }

  const handleSave = () => {
    // Mevcut state zaten onChange ile güncelleniyor, sadece UI geri bildirimi veriyoruz
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
      
      {showSuccess && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <p className="font-bold text-sm">Tercihleriniz başarıyla kaydedildi.</p>
        </div>
      )}

      <div className="space-y-8 divide-y divide-slate-100">
        
        {/* Zorunlu Çerezler */}
        <div className="pt-8 first:pt-0 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex gap-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl h-fit"><ShieldAlert size={24} /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Zorunlu Çerezler</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Sisteme giriş yapmanız, güvenlik doğrulamaları (Turnstile) ve temel site fonksiyonları için gereklidir. Kapatılamaz.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400">Her Zaman Aktif</span>
            <Switch checked={true} onChange={() => {}} disabled={true} ariaLabel="Zorunlu Çerezler" />
          </div>
        </div>

        {/* İşlevsel Çerezler */}
        <div className="pt-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex gap-4">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl h-fit"><Settings size={24} /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">İşlevsel Çerezler</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Dil seçiminiz, arayüz tercihleriniz ve sınıf filtreleri gibi kişiselleştirmelerin hatırlanmasını sağlar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${preferences.functional ? "text-sky-600" : "text-slate-400"}`}>
              {preferences.functional ? "Aktif" : "Pasif"}
            </span>
            <Switch 
              checked={preferences.functional} 
              onChange={(v) => updatePreferences({ functional: v })} 
              ariaLabel="İşlevsel Çerezler" 
            />
          </div>
        </div>

        {/* Analiz Çerezleri */}
        <div className="pt-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl h-fit"><Activity size={24} /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Analiz ve Performans (Google Analytics vb.)</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Sitenin ne kadar ziyaret edildiği, hangi materyallerin daha çok kullanıldığı gibi anonim istatistikleri toplamamıza yardımcı olur.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${preferences.analytics ? "text-sky-600" : "text-slate-400"}`}>
              {preferences.analytics ? "Aktif" : "Pasif"}
            </span>
            <Switch 
              checked={preferences.analytics} 
              onChange={(v) => updatePreferences({ analytics: v })} 
              ariaLabel="Analiz Çerezleri" 
            />
          </div>
        </div>

        {/* Pazarlama Çerezleri */}
        <div className="pt-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl h-fit"><Megaphone size={24} /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pazarlama ve Hedefleme (Meta Pixel vb.)</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Platform dışındaki eğitim kampanyalarımızın etkinliğini ölçmek ve size uygun eğitim duyuruları göstermek için kullanılır.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${preferences.marketing ? "text-sky-600" : "text-slate-400"}`}>
              {preferences.marketing ? "Aktif" : "Pasif"}
            </span>
            <Switch 
              checked={preferences.marketing} 
              onChange={(v) => updatePreferences({ marketing: v })} 
              ariaLabel="Pazarlama Çerezleri" 
            />
          </div>
        </div>
      </div>

      {/* Aksiyon Butonları */}
      <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
        <button 
          onClick={rejectAllOptional}
          className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Sadece Zorunluları Kabul Et
        </button>
        <button 
          onClick={acceptAll}
          className="px-6 py-3 rounded-xl font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors border border-sky-100"
        >
          Tümünü Kabul Et
        </button>
        <button 
          onClick={handleSave}
          className="px-8 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-md"
        >
          Seçimlerimi Kaydet
        </button>
      </div>

    </div>
  );
}