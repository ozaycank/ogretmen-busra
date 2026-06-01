import React from "react";
import { Metadata } from "next";
import { Heart, Target, Sparkles, BookOpen, Users, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Hakkımızda | Büşra Öğretmen",
  description: "Türkiye'nin en kapsamlı ve tamamen ücretsiz eğitim materyalleri paylaşım platformunun kuruluş amacı ve vizyonu.",
};

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-20">
      
      {/* 1. Hero Section (Karşılama) */}
      <section className="text-center max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 text-sky-700 text-sm font-bold mb-6">
          <Sparkles size={16} />
          <span>Eğitimde Fırsat Eşitliği</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
          Bilgi, paylaştıkça çoğalan <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-rose-500">
            tek hazinedir.
          </span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Büşra Öğretmen platformu, Türkiye'nin dört bir yanındaki eğitimcilere, öğrencilere ve velilere 
          ücretsiz, kaliteli ve güvenilir eğitim materyalleri sunmak amacıyla kurulmuş bağımsız bir projedir.
        </p>
      </section>

      {/* 2. Misyon & Vizyon */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-100 rounded-[2rem] p-10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-6">
              <Target size={28} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Misyonumuz</h2>
            <p className="text-slate-600 leading-relaxed">
              Öğretmenlerin ders hazırlık süreçlerini kolaylaştırmak, öğrencilerin akademik gelişimlerini 
              destekleyecek eğlenceli ve öğretici içerikleri herkes için erişilebilir kılmak. 
              Hiçbir ticari kaygı gütmeden, eğitimi zenginleştirecek araçları ücretsiz sunmak.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2rem] p-10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
              <Heart size={28} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Vizyonumuz</h2>
            <p className="text-slate-600 leading-relaxed">
              Türkiye'nin en büyük, en güncel ve en güvenilir dijital eğitim kütüphanesi olmak. 
              Öğretmenlerin sadece içerik indirdiği değil, kendi ürettikleri materyalleri de meslektaşlarıyla 
              paylaşarak dev bir dayanışma ağı oluşturduğu bir ekosistem yaratmak.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Temel Değerlerimiz (Platform Goals) */}
      <section className="space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900">Temel Değerlerimiz</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 rounded-3xl p-8 text-center hover:-translate-y-1 transition-transform">
            <div className="mx-auto w-12 h-12 bg-white text-emerald-500 rounded-xl flex items-center justify-center shadow-sm mb-5">
              <BookOpen size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Sürekli Güncel</h3>
            <p className="text-sm text-slate-600">MEB müfredatına ve eğitimdeki yeni yaklaşımlara uygun, modern içerikler.</p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 text-center hover:-translate-y-1 transition-transform">
            <div className="mx-auto w-12 h-12 bg-white text-indigo-500 rounded-xl flex items-center justify-center shadow-sm mb-5">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Topluluk Odaklı</h3>
            <p className="text-sm text-slate-600">Öğretmenlerin bir araya gelerek birbirini desteklediği interaktif bir yapı.</p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 text-center hover:-translate-y-1 transition-transform">
            <div className="mx-auto w-12 h-12 bg-white text-amber-500 rounded-xl flex items-center justify-center shadow-sm mb-5">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Güvenilir İçerik</h3>
            <p className="text-sm text-slate-600">Eklenen her materyalin güvenlik ve pedagojik uygunluk açısından editör onayından geçmesi.</p>
          </div>
        </div>
      </section>

      {/* 4. Ekip (Opsiyonel / Placeholder) */}
      <section className="bg-white border border-slate-100 rounded-[2.5rem] p-10 md:p-16 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 bg-gradient-to-br from-sky-400 to-rose-400 rounded-full p-1">
            <div className="w-full h-full bg-white rounded-full overflow-hidden flex items-center justify-center">
              {/* Buraya gerçek profil fotoğrafı eklenebilir. Şu an fallback olarak ikon var. */}
              <Users size={64} className="text-slate-200" />
            </div>
          </div>
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-3xl font-black text-slate-900">Hikayemiz</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Yıllarca sınıf öğretmenliği yaparken, ihtiyaç duyduğum materyalleri tek bir 
              yerde, güvenilir bir şekilde bulmanın ne kadar zor olduğunu fark ettim. 
              Geceler boyu hazırladığım etkinlik kağıtlarının sadece benim sınıfımda kalmasını 
              istemedim. İşte bu platform, o küçük fikrin tüm Türkiye'yi kapsayan büyük bir 
              eğitim projesine dönüşmüş halidir.
            </p>
            <div className="pt-2">
              <p className="font-bold text-slate-900 text-lg">Büşra Öğretmen</p>
              <p className="text-sky-600 font-medium">Kurucu & İçerik Editörü</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}