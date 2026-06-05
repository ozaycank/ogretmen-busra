"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Tarayıcıdaki mevcut sayfanın URL'sini al
    const url = window.location.href;

    // 1. Mobil cihazlar için Native Share Menüsü (Eğer tarayıcı destekliyorsa)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Büşra Öğretmen",
          text: `${title} - Bu harika eğitim materyaline göz at!`,
          url: url,
        });
        return; // Başarılıysa fonksiyonu bitir
      } catch (error) {
        console.log("Paylaşım menüsü kapatıldı veya bir hata oluştu.", error);
      }
    }

    // 2. Masaüstü cihazlar için Fallback (Panoya Kopyala)
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2 saniye sonra tiki eski haline getir
    } catch (err) {
      console.error("Link kopyalanamadı:", err);
      alert("Link kopyalanamadı.");
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-6 py-4 rounded-2xl font-bold transition-colors border border-slate-200 min-w-[140px] cursor-pointer"
    >
      {copied ? (
        <>
          <Check size={20} className="text-emerald-600" />
          <span className="text-emerald-700">Kopyalandı</span>
        </>
      ) : (
        <>
          <Share2 size={20} />
          <span>Paylaş</span>
        </>
      )}
    </button>
  );
}