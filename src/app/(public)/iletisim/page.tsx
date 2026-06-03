import React from "react";
import { Metadata } from "next";
import ContactForm from "@/components/features/contact/ContactForm";
import { Mail, MapPin, Sparkles, MessageCircleHeart } from "lucide-react";

export const metadata: Metadata = {
  title: "İletişim | Büşra Öğretmen",
  description: "Öneri, şikayet, iş birliği veya materyal kaldırma talepleriniz için bizimle iletişime geçin.",
};

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto pb-12 pt-8">
      
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-sm font-bold mb-6">
          <MessageCircleHeart size={16} />
          <span>Bize Ulaşın</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
          Fikirlerinizi Önemsiyoruz
        </h1>
        <p className="text-lg text-slate-500">
          Sisteme eklenmesini istediğiniz özellikler, iş birliği teklifleri veya telif hakları ile ilgili konular için 
          mesajınızı bekliyoruz.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Sol Taraf: İletişim Bilgileri */}
        <aside className="w-full lg:w-[400px] flex-shrink-0 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6">İletişim Kanalları</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">E-posta</h3>
                  <p className="text-slate-500 text-sm mb-1">Tüm sorularınız ve destek için:</p>
                  <a href="mailto:iletisim@ogretmenbusra.com" className="text-sky-600 font-bold hover:underline">iletisim@ogretmenbusra.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Lokasyon</h3>
                  <p className="text-slate-500 text-sm mb-1">Fiziksel ofisimiz bulunmamaktadır, tamamen uzaktan çalışan bağımsız bir ekibiz.</p>
                  <span className="text-emerald-700 font-bold text-sm">Türkiye</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <Sparkles className="text-amber-400 mb-4" size={28} />
            <h3 className="text-xl font-bold mb-2">Telif Hakları Uyarısı</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Platformumuzdaki içerikler öğretmenler tarafından tamamen gönüllülük esasıyla yüklenmektedir. 
              Size ait telifli bir eser tespit ederseniz, URL bağlantısı ile birlikte bildirmeniz halinde 
              içerik 24 saat içinde sistemden kaldırılacaktır.
            </p>
          </div>
        </aside>

        {/* Sağ Taraf: İletişim Formu */}
        <main className="flex-1 w-full">
          <ContactForm />
        </main>

      </div>
    </div>
  );
}