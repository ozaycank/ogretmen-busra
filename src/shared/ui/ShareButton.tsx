"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";

interface ShareButtonProps {
  title: string;
  slug?: string; // Ekledik: Takip için URL bağlamını bilelim
}

export default function ShareButton({ title, slug = "unknown" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    // 1. Mobil cihazlar için Native Share
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Büşra Öğretmen",
          text: `${title} - Bu harika eğitim materyaline göz at!`,
          url: url,
        });
        // Sadece başarılı share (iptal edilmezse) gönderilir
        sendGAEvent({ event: "share", method: "native_share", content_type: "material", item_id: slug });
        return; 
      } catch (error) {
        // İptal edilme durumunda log düşme, event yollama
        console.log("Paylaşım iptal edildi.");
      }
    }

    // 2. Masaüstü cihazlar için Fallback (Panoya Kopyala)
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      sendGAEvent({ event: "share", method: "copy_link", content_type: "material", item_id: slug });
      setTimeout(() => setCopied(false), 2000); 
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