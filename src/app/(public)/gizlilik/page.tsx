import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck, FileText } from "lucide-react";
import PrintButton from "@/shared/ui/PrintButton";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Büşra Öğretmen",
  description: "Büşra Öğretmen eğitim platformunun kişisel verileri işleme, KVKK ve GDPR uyumluluk bildirimleri ve gizlilik koşulları.",
  openGraph: {
    title: "Gizlilik Politikası | Büşra Öğretmen",
    description: "Kişisel verilerinizin nasıl korunduğunu öğrenin.",
    type: "website",
    url: "https://ogretmenbusra.com/gizlilik",
  }
};

// İçindekiler Menüsü İçin Veri Yapısı
const POLICY_SECTIONS = [
  { id: "giris", title: "1. Giriş ve Kapsam" },
  { id: "veri-sorumlusu", title: "2. Veri Sorumlusu" },
  { id: "toplanan-veriler", title: "3. Toplanan Bilgiler" },
  { id: "kullanici-icerikleri", title: "4. Kullanıcı İçerikleri (Upload)" },
  { id: "cerezler-izleme", title: "5. Çerezler ve İzleme (Turnstile)" },
  { id: "kimlik-dogrulama", title: "6. Kimlik Doğrulama Verileri" },
  { id: "log-kayitlari", title: "7. İndirme ve Etkinlik Logları" },
  { id: "veri-saklama", title: "8. Veri Saklama ve İmha" },
  { id: "ucuncu-taraflar", title: "9. Üçüncü Taraf Servisler (Cloudflare)" },
  { id: "kullanici-haklari", title: "10. Kullanıcı Hakları (KVKK & GDPR)" },
  { id: "veri-silme", title: "11. Veri Silme Talepleri" },
  { id: "iletisim", title: "12. İletişim" },
];

export default function PrivacyPolicyPage() {
  const lastUpdated = "1 Haziran 2026"; // Statik veya build-time değişken

  // JSON-LD Zengin Sonuç Şeması (Breadcrumb ve WebPage)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://ogretmenbusra.com/gizlilik",
        "url": "https://ogretmenbusra.com/gizlilik",
        "name": "Gizlilik Politikası | Büşra Öğretmen",
        "dateModified": new Date("2026-06-01").toISOString(),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "https://ogretmenbusra.com" },
          { "@type": "ListItem", "position": 2, "name": "Gizlilik Politikası", "item": "https://ogretmenbusra.com/gizlilik" }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto pb-16 pt-8">
        
        {/* Başlık ve Navigasyon Alanı */}
        <header className="mb-12 print:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
            <nav className="flex items-center text-sm font-medium text-slate-500">
              <Link href="/" className="hover:text-sky-600 transition-colors">Ana Sayfa</Link>
              <ChevronRight size={16} className="mx-2" />
              <span className="text-slate-900">Gizlilik Politikası</span>
            </nav>
            {/* Yazdır Butonu Optimizasyonu: Üst köşeye alındı */}
            <PrintButton />
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-bold mb-4 print:hidden">
              <ShieldCheck size={16} className="text-sky-600" />
              <span>KVKK ve GDPR Uyumlu</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Gizlilik Politikası</h1>
            <p className="text-slate-500 mt-3 text-lg">Son Güncelleme: {lastUpdated}</p>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Sol: İçindekiler Menüsü (Genişlik Optimize Edildi, Taşma Önlendi) */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 print:hidden">
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm sticky top-24">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-sky-500" />
                İçindekiler
              </h2>
              {/* pr-2 padding right eklendi, overflow-x-hidden ile yatay scroll engellendi, break-words ile metin taşması engellendi */}
              <nav className="space-y-1 max-h-[65vh] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                {POLICY_SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors whitespace-normal break-words leading-snug"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Sağ: Politika İçeriği */}
          <main className="flex-1 min-w-0 bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm print:border-none print:shadow-none print:p-0">
            <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-sky-600 prose-li:text-slate-600">
              
              <PolicySection id="giris" title="1. Giriş ve Kapsam">
                <p>
                  Büşra Öğretmen Eğitim Platformu ("Platform", "Biz"), öğretmenlerin, öğrencilerin ve velilerin ücretsiz eğitim materyallerine erişebildiği ve içerik paylaşabildiği bir sistemdir. Gizliliğinize değer veriyoruz ve kişisel verilerinizi 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve Avrupa Birliği Genel Veri Koruma Tüzüğü ("GDPR") standartlarına uygun olarak işliyoruz.
                </p>
                <p>
                  Bu Gizlilik Politikası, platformumuzu (ogretmenbusra.com) ziyaret ettiğinizde, üye olduğunuzda veya materyal yüklediğinizde kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
                </p>
              </PolicySection>

              <PolicySection id="veri-sorumlusu" title="2. Veri Sorumlusu">
                <p>
                  KVKK uyarınca "Veri Sorumlusu" sıfatıyla Büşra Öğretmen platformu yönetimi, kişisel verilerinizi bu politikada açıklanan amaçlar doğrultusunda işlemektedir. Bizimle iletişime geçmek için iletişim sayfamızı kullanabilir veya <strong>iletisim@ogretmenbusra.com</strong> adresine e-posta gönderebilirsiniz.
                </p>
              </PolicySection>

              <PolicySection id="toplanan-veriler" title="3. Toplanan Bilgiler">
                <p>Platformumuzu kullanırken aşağıdaki veri türlerini toplarız:</p>
                <ul>
                  <li><strong>Kimlik Verileri:</strong> Üyelik ve materyal yükleme formlarında doldurduğunuz ad, soyad ve unvan bilgileri.</li>
                  <li><strong>İletişim Verileri:</strong> E-posta adresiniz.</li>
                  <li><strong>İşlem Güvenliği Verileri:</strong> Anonimleştirilmiş IP adresleri (hashing yöntemiyle), tarayıcı bilgileri (User-Agent) ve sisteme giriş/çıkış logları.</li>
                </ul>
              </PolicySection>

              <PolicySection id="kullanici-icerikleri" title="4. Kullanıcı İçerikleri (Upload)">
                <p>
                  Platformumuza eğitim amaçlı etkinlik, ödev veya çalışma kağıtları yüklediğinizde, bu dosyalar güvenlik taramasından geçirilir. Yüklediğiniz dosyaların içerisinde bilerek veya bilmeyerek bıraktığınız kişisel verilerden (örn: belgenin altındaki adınız, okulunuz) siz sorumlusunuz.
                </p>
                <p>
                  Yüklenen dosyalar yüksek güvenlikli <strong>Cloudflare R2</strong> bulut depolama sunucularında barındırılır.
                </p>
              </PolicySection>

              <PolicySection id="cerezler-izleme" title="5. Çerezler ve İzleme (Turnstile)">
                <p>
                  Platformumuz, gizliliğinizi ihlal eden reklam veya pazarlama çerezleri <strong>kullanmamaktadır.</strong> Sadece sistemin güvenli çalışması için zorunlu çerezler kullanılır. 
                  Ayrıca bot saldırılarını ve spam yüklemeleri engellemek amacıyla gizlilik odaklı <strong>Cloudflare Turnstile</strong> teknolojisi kullanılmaktadır. Turnstile, reCAPTCHA'nın aksine kullanıcıların kişisel verilerini sömürmez.
                </p>
              </PolicySection>

              <PolicySection id="kimlik-dogrulama" title="6. Kimlik Doğrulama Verileri">
                <p>
                  Eğer platforma üyeyseniz, parolalarınız veri tabanımızda düz metin olarak <strong>kesinlikle tutulmaz.</strong> Endüstri standardı olan güçlü kriptografik özetleme algoritmaları (Bcrypt) kullanılarak geri döndürülemez şekilde şifrelenir. Sistem yöneticilerimiz dahi parolanızı göremez.
                </p>
              </PolicySection>

              <PolicySection id="log-kayitlari" title="7. İndirme ve Etkinlik Logları">
                <p>
                  Hangi materyalin ne kadar indirildiğini göstermek ve sahte indirme saldırılarını engellemek amacıyla IP adresleriniz anonimleştirilerek (hashing) kısa süreliğine loglanır. Bu veriler reklam profillemesi için kullanılmaz.
                </p>
              </PolicySection>

              <PolicySection id="veri-saklama" title="8. Veri Saklama ve İmha">
                <p>
                  Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca saklanır. Üyeliğinizi iptal ettiğinizde veya verilerinizin silinmesini talep ettiğinizde, yasal olarak saklamakla yükümlü olduğumuz log kayıtları (5651 sayılı Kanun gereği 2 yıl) haricindeki tüm verileriniz kalıcı olarak imha edilir.
                </p>
              </PolicySection>

              <PolicySection id="ucuncu-taraflar" title="9. Üçüncü Taraf Servisler">
                <p>
                  Verilerinizi asla reklam ajanslarına veya veri tüccarlarına <strong>satmıyoruz.</strong> Ancak platformun çalışması için bazı güvenilir altyapı sağlayıcılarıyla çalışıyoruz:
                </p>
                <ul>
                  <li><strong>Cloudflare:</strong> CDN (İçerik Dağıtım Ağı), DDoS koruması, Turnstile bot koruması ve R2 dosya depolama hizmetleri.</li>
                  <li><strong>PostgreSQL Veritabanı Sağlayıcısı:</strong> Şifrelenmiş (encrypted at rest) veritabanı altyapısı.</li>
                </ul>
              </PolicySection>

              <PolicySection id="kullanici-haklari" title="10. Kullanıcı Hakları (KVKK & GDPR)">
                <p>KVKK'nın 11. maddesi ve GDPR uyarınca aşağıdaki haklara sahipsiniz:</p>
                <ul>
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                  <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
                  <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                  <li>Eksik veya yanlış işlenen verilerin düzeltilmesini isteme,</li>
                  <li>Kişisel verilerinizin silinmesini veya yok edilmesini (Unutulma Hakkı) talep etme.</li>
                </ul>
              </PolicySection>

              <PolicySection id="veri-silme" title="11. Veri Silme Talepleri">
                <p>
                  Sistemdeki üyeliğinizi iptal etmek veya yüklediğiniz bir materyalin (ve size ait bilgilerin) tamamen silinmesini talep etmek için iletişim formunu kullanabilir veya bize doğrudan e-posta gönderebilirsiniz. Talebiniz en geç 30 gün içerisinde sonuçlandırılacaktır.
                </p>
              </PolicySection>

              <PolicySection id="iletisim" title="12. İletişim">
                <p>
                  Gizlilik politikamızla veya kişisel verilerinizle ilgili her türlü soru, görüş ve talebiniz için Veri Sorumlusuna aşağıdaki kanaldan ulaşabilirsiniz:
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-4 inline-block print:border-slate-300">
                  <p className="font-bold text-slate-900 m-0">E-posta:</p>
                  <a href="mailto:iletisim@ogretmenbusra.com" className="text-sky-600 font-bold m-0 hover:underline">iletisim@ogretmenbusra.com</a>
                </div>
              </PolicySection>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// -------------------------------------------------------------
// YENİDEN KULLANILABİLİR POLİTİKA BÖLÜMÜ BİLEŞENİ
// -------------------------------------------------------------
function PolicySection({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 mb-12 pb-12 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0 print:border-b-0 print:mb-6 print:pb-0">
      <h2 className="text-2xl font-black text-slate-900 mb-6">{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}