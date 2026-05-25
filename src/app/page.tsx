import React from "react";
import Link from "next/link";
import MaterialCard from "@/components/MaterialCard";
import { Sparkles, ArrowRight } from "lucide-react";
// import prisma from "@/lib/prisma"; // Gerçek backend entegrasyonu başladığında aktif edilecek

// Geliştirme aşamasında backend'i simüle eden mock fonksiyon (loading.tsx'i test etmek için 2 saniye bekler)
async function getLatestMaterials() {
  /* GERÇEK BACKEND KODU BURADA OLACAK:
  return await prisma.material.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  */

  await new Promise((resolve) => setTimeout(resolve, 2000)); // DB Gecikme simülasyonu
  
  return [
    {
      id: "1", title: "1. Sınıf İlk Okuma Yazma - E Sesi Fasikülü", description: "Öğrencilerin E sesini kolayca kavraması için hazırlanmış boyamalı ve eğlenceli etkinlik kağıtları.", fileType: "pdf", authorName: "Büşra Öğretmen", grade: "SINIF_1", category: "ETKINLIK", viewCount: 1250, downloadCount: 840,
    },
    {
      id: "2", title: "4. Sınıf Fen Bilimleri Yer Kabuğu Yapbozu", description: "Yer kabuğunun yapısını anlatan kes-yapıştır etkinlik sayfası.", fileType: "pdf", authorName: "Ali Veli (Öğretmen)", grade: "SINIF_4", category: "INTERAKTIF_OYUN", viewCount: 450, downloadCount: 120,
    },
    {
      id: "3", title: "Scratch İle İlk Kodlama Oyunu", description: "Blok tabanlı kodlama ile kedi yakalama oyunu yapımı yönergeleri.", fileType: "docx", authorName: "Büşra Öğretmen", grade: "GENEL", category: "KODLAMA", viewCount: 890, downloadCount: 650,
    }
  ];
}

export default async function Home() {
  // Server tarafında veriler çekilir. Bu işlem bitene kadar loading.tsx ekranda kalır.
  const latestMaterials = await getLatestMaterials();

  return (
    <div className="space-y-16">
      
      {/* Hero Section - Dikkat Çekici Karşılama */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-[2.5rem] p-10 md:p-16 overflow-hidden shadow-2xl">
        {/* Dekoratif arka plan öğeleri */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-[#e11d48] rounded-full blur-[120px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-[#0284c7] rounded-full blur-[120px] opacity-20 pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
            <Sparkles size={16} className="text-amber-400" />
            <span>Binlerce ücretsiz eğitim materyali</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Eğitimi Eğlenceli <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-rose-400">
              Hale Getiriyoruz
            </span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-xl">
            Sınıfınıza enerji katacak etkinlikler, ödevler ve konu anlatımları.
            Araştırmaya hemen başlayın veya kendi içeriklerinizi ekleyerek diğer öğretmenlere ilham verin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/materyaller" className="bg-white text-slate-900 px-8 py-3.5 rounded-full font-bold text-center hover:bg-gray-50 transition-colors shadow-lg flex items-center justify-center gap-2">
              Keşfetmeye Başla <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* İçerik Listeleme Section */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">En Yeni Materyaller</h2>
            <p className="text-gray-500 mt-2">Sisteme yeni eklenen onaylı içerikler.</p>
          </div>
          <Link href="/materyaller" className="hidden sm:flex items-center gap-1 text-[#0284c7] font-semibold hover:underline">
            Tümünü Gör <ArrowRight size={16} />
          </Link>
        </div>

        {/* Veritabanından gelen verilerin map ile ekrana basılması */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link href="/materyaller" className="inline-flex items-center gap-1 text-[#0284c7] font-semibold hover:underline">
            Tümünü Gör <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}