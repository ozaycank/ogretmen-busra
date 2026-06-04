"use client";

import React, { useEffect } from "react";
import { logErrorToMonitoring } from "@/infrastructure/monitoring/monitoring";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function AppErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  
  useEffect(() => {
    logErrorToMonitoring(error, error.digest);
  }, [error]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-4">
      <div className="bg-rose-50 p-4 rounded-full text-rose-500 mb-4">
        <AlertCircle size={32} />
      </div>
      
      <h2 className="text-xl font-black text-slate-900 mb-2 text-center" aria-live="polite">
        Sayfa Yüklenirken Bir Sorun Oluştu
      </h2>
      
      <p className="text-sm text-slate-500 text-center max-w-md mb-6">
        Görüntülemeye çalıştığınız içeriğe şu anda ulaşılamıyor. Lütfen sayfayı yenilemeyi deneyin.
      </p>

      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm focus:ring-2 focus:ring-slate-300 outline-none"
      >
        <RefreshCcw size={18} /> Tekrar Dene
      </button>

      {error.digest && (
        <p className="mt-6 text-xs text-slate-400 font-mono text-center">
          Hata İz: {error.digest}
        </p>
      )}
    </div>
  );
}