"use client"; // Hata sınırları (Error Boundaries) her zaman istemci bileşeni olmalıdır

import React, { useEffect } from "react";
import { logErrorToMonitoring } from "@/infrastructure/monitoring/monitoring";
import { AlertTriangle, RefreshCcw, Home, LifeBuoy } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  
  useEffect(() => {
    // Hata oluştuğunda izleme sistemine (Monitoring) kaydet
    logErrorToMonitoring(error, error.digest);
  }, [error]);

  return (
    <html lang="tr">
      <body className="antialiased bg-slate-50 text-slate-900 font-sans">
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 text-center border border-slate-100 relative overflow-hidden">
            
            {/* Üst Kırmızı Dekorasyon */}
            <div className="absolute top-0 left-0 w-full h-2 bg-rose-500" />

            <div className="mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle size={40} className="text-rose-500" />
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-3" aria-live="assertive">
              Sistemik Bir Hata Oluştu
            </h1>
            
            <p className="text-slate-500 mb-8 leading-relaxed">
              Platformun çekirdek yapısında beklenmeyen bir sorunla karşılaştık. Mühendislik ekibimiz durumdan haberdar edildi.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => reset()}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors focus:ring-4 focus:ring-slate-200 outline-none"
              >
                <RefreshCcw size={18} /> Yeniden Dene
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/"
                  className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors focus:ring-4 focus:ring-slate-200 outline-none"
                >
                  <Home size={18} /> Ana Sayfa
                </a>
                <a
                  href="mailto:iletisim@ogretmenbusra.com"
                  className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors focus:ring-4 focus:ring-slate-200 outline-none"
                >
                  <LifeBuoy size={18} /> Destek
                </a>
              </div>
            </div>

            {/* Sorun Giderme (Troubleshooting) için Hash Kodu */}
            {error.digest && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-mono">
                  Hata Kodu: {error.digest}
                </p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}