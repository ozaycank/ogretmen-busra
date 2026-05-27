"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, ArrowLeft } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

export default function MaterialError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hatayı Sentry paneline gönder
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-rose-50 p-6 rounded-full text-rose-500 mb-6">
        <AlertOctagon size={48} />
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-4">Bir Şeyler Ters Gitti!</h1>
      <p className="text-slate-500 max-w-md mb-8 text-lg">
        Aradığınız materyal yayından kaldırılmış veya URL hatalı olabilir.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/materyaller" 
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={18} /> Tüm Materyallere Dön
        </Link>
        <button 
          onClick={() => reset()}
          className="px-6 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}