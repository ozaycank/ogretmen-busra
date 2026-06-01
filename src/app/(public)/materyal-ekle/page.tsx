import React from "react";
import { Metadata } from "next";
import UploadForm from "@/components/features/upload/UploadForm";
import { ShieldCheck, Zap, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Etkinlik ve Materyal Paylaş | Büşra Öğretmen",
  description: "Kendi hazırladığınız veya faydalı bulduğunuz eğitim materyallerini diğer öğretmenlerle güvenle paylaşın.",
};

export default function MaterialUploadPage() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 pb-12 items-start">
      
      {/* Sol: Bilgilendirme Alanı */}
      <aside className="w-full lg:w-[400px] flex-shrink-0 space-y-8 sticky top-24">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Deneyiminizi <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-rose-500">Paylaşın</span>
          </h1>
          <p className="text-slate-500 mt-4 leading-relaxed">
            Eğitim paylaştıkça çoğalır. Hazırladığınız etkinlikleri, çalışma kağıtlarını ve ödevleri sisteme yükleyerek binlerce meslektaşınıza ve öğrenciye ulaşmasını sağlayın.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl h-fit"><ShieldCheck size={24} /></div>
            <div>
              <h3 className="font-bold text-slate-900">Güvenli ve Kontrollü</h3>
              <p className="text-sm text-slate-500 mt-1">Yüklediğiniz dosyalar otomatik virüs taramasından ve manuel editör onayından geçer.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl h-fit"><Zap size={24} /></div>
            <div>
              <h3 className="font-bold text-slate-900">Doğrudan Cloudflare R2</h3>
              <p className="text-sm text-slate-500 mt-1">Dosyalarınız yüksek hızlı global sunucularda barındırılır, anında erişilir.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl h-fit"><Heart size={24} /></div>
            <div>
              <h3 className="font-bold text-slate-900">Tamamen Ücretsiz</h3>
              <p className="text-sm text-slate-500 mt-1">Bu platform ticari amaç gütmez. Bilgi, onu arayan herkes için bedavadır.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Sağ: Form Alanı */}
      <main className="flex-1 w-full">
        <UploadForm />
      </main>

    </div>
  );
}