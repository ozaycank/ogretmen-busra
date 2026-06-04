import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileCheck, Scale, Printer } from "lucide-react";
import PrintButton from "@/shared/ui/PrintButton";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | Büşra Öğretmen",
  description: "Büşra Öğretmen eğitim platformunun kullanım koşulları, içerik politikaları, telif hakları ve yasal uyarılar.",
  openGraph: {
    title: "Kullanım Koşulları | Büşra Öğretmen",
    description: "Platform kurallarımızı, haklarınızı ve sorumluluklarınızı öğrenin.",
    type: "website",
    url: "https://ogretmenbusra.com/kullanim-kosullari",
  }
};

const TERMS_SECTIONS = [
  { id: "kabul", title: "1. Şartların Kabulü" },
  { id: "tanimlar", title: "2. Tanımlar" },
  { id: "kullanim-amaci", title: "3. Platformun Kullanım Amacı" },
  { id: "hesap-ve-guvenlik", title: "4. Hesap ve Güvenlik" },
  { id: "icerik-yukleme", title: "5. İçerik Yükleme ve Telif Hakları" },
  { id: "yasakli-faaliyetler", title: "6. Yasaklı Faaliyetler" },
  { id: "moderasyon", title: "7. Moderasyon ve Denetim" },
  { id: "sorumluluk-reddi", title: "8. Sorumluluk Reddi (Disclaimer)" },
  { id: "hizmet-kesintileri", title: "9. Hizmet Kesintileri" },
  { id: "hesap-fesh", title: "10. İhlaller ve Hesabın Feshi" },
  { id: "uyusmazlik", title: "11. Uyuşmazlık Çözümü" },
  { id: "iletisim", title: "12. İletişim" },
];

export default function TermsOfServicePage() {
  const lastUpdated = "1 Haziran 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://ogretmenbusra.com/kullanim-kosullari",
        "url": "https://ogretmenbusra.com/kullanim-kosullari",
        "name": "Kullanım Koşulları | Büşra Öğretmen",
        "dateModified": new Date("2026-06-01").toISOString(),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "https://ogretmenbusra.com" },
          { "@type": "ListItem", "position": 2, "name": "Kullanım Koşulları", "item": "https://ogretmenbusra.com/kullanim-kosullari" }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto pb-16 pt-8 px-4 sm:px-6 lg:px-8">
        
        <header className="mb-12 print:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
            <nav className="flex items-center text-sm font-medium text-slate-500">
              <Link href="/" className="hover:text-sky-600 transition-colors">Ana Sayfa</Link>
              <ChevronRight size={16} className="mx-2" />
              <span className="text-slate-900">Kullanım Koşulları</span>
            </nav>
            <PrintButton />
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/50 text-slate-700 text-sm font-bold mb-4 print:hidden">
              <Scale size={16} className="text-amber-600" />
              <span>Yasal Bildirim</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Kullanım Koşulları</h1>
            <p className="text-slate-500 mt-3 text-lg">Son Güncelleme: {lastUpdated}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <aside className="lg:col-span-3 xl:col-span-3 print:hidden">
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm sticky top-24 w-full">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileCheck size={18} className="text-amber-500" />
                İçindekiler
              </h2>
              <nav className="space-y-1 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                {TERMS_SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors leading-snug break-words"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-9 xl:col-span-9 w-full min-w-0 bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm print:border-none print:shadow-none print:p-0">
            <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-sky-600 prose-li:text-slate-600">
              
              <TermsSection id="kabul" title="1. Şartların Kabulü">
                <p>
                  Büşra Öğretmen Eğitim Platformu'na ("Platform", "Site") erişerek, kayıt olarak veya materyal indirerek/yükleyerek işbu Kullanım Koşulları'nı ("Koşullar") tamamen okuduğunuzu, anladığınızı ve hukuki olarak bağlayıcı olduğunu kabul etmiş sayılırsınız. Bu koşulları kabul etmiyorsanız, platformu kullanmayı derhal bırakmalısınız.
                </p>
              </TermsSection>

              <TermsSection id="tanimlar" title="2. Tanımlar">
                <ul>
                  <li><strong>Platform:</strong> ogretmenbusra.com alan adı üzerinden hizmet veren dijital kütüphaneyi ifade eder.</li>
                  <li><strong>Kullanıcı:</strong> Platformu ziyaret eden, üye olan veya içerik indiren gerçek veya tüzel kişileri ifade eder.</li>
                  <li><strong>Yükleyici (Uploader):</strong> Kendi rızasıyla platforma eğitim materyali ekleyen kullanıcıyı ifade eder.</li>
                  <li><strong>Materyal:</strong> Kullanıcılar tarafından yüklenen PDF, DOCX, Resim veya Arşiv (ZIP/RAR) formatlarındaki her türlü eğitsel içeriği ifade eder.</li>
                </ul>
              </TermsSection>

              <TermsSection id="kullanim-amaci" title="3. Platformun Kullanım Amacı">
                <p>
                  Platform, öğretmenlerin, öğrencilerin ve velilerin eğitim-öğretim faaliyetlerini desteklemek amacıyla ücretsiz materyal paylaşımını teşvik eder. Platform üzerinden indirilen materyaller <strong>ticari amaçlarla kullanılamaz, satılamaz veya ücretli platformlarda izinsiz olarak yeniden paylaşılamaz.</strong>
                </p>
              </TermsSection>

              <TermsSection id="hesap-ve-guvenlik" title="4. Hesap ve Güvenlik">
                <p>
                  Platformun belirli özelliklerini kullanabilmek için (örn: dosya yükleme) hesap oluşturmanız gerekebilir. Hesabınızın güvenliğini (şifre gizliliği vb.) sağlamak tamamen sizin sorumluluğunuzdadır. Hesabınız üzerinden yapılan tüm yasal ve yasa dışı işlemlerden hesap sahibi sorumlu tutulacaktır.
                </p>
              </TermsSection>

              <TermsSection id="icerik-yukleme" title="5. İçerik Yükleme ve Telif Hakları (IP)">
                <p>
                  Platforma materyal yükleyen Kullanıcılar aşağıdaki şartları kesin olarak kabul etmiş sayılır:
                </p>
                <ul>
                  <li>Yüklediğiniz materyalin yasal sahibi olduğunuzu veya eser sahibinden (5846 sayılı Fikir ve Sanat Eserleri Kanunu kapsamında) gerekli yayın izinlerini aldığınızı beyan edersiniz.</li>
                  <li>Diğer yayınevlerine ait telifli kitapların (soru bankaları, deneme sınavları vb.) taranmış kopyalarını, MEB e-okul sistemindeki gizli dokümanları yüklemek <strong>kesinlikle yasaktır.</strong></li>
                  <li>Platforma yüklediğiniz içeriğin, diğer kullanıcılar tarafından ücretsiz olarak indirilmesi, sınıf ortamında kullanılması veya değiştirilmesine (Eğitim Amacıyla) sınırsız bir lisans vermiş olursunuz.</li>
                </ul>
              </TermsSection>

              <TermsSection id="yasakli-faaliyetler" title="6. Yasaklı Faaliyetler">
                <p>Kullanıcıların aşağıdaki faaliyetlerde bulunması yasaktır:</p>
                <ul>
                  <li>Sisteme virüs, truva atı (Trojan), zararlı yazılım (Malware) içeren dosyalar yüklemeye çalışmak.</li>
                  <li>Güvenlik sistemlerini, rate-limit (hız sınırı) kısıtlamalarını veya Cloudflare Turnstile bot korumasını aşmaya çalışmak.</li>
                  <li>Siyasi, dini propoganda içeren, nefret söylemi, ayrımcılık veya şiddet barındıran materyaller yüklemek.</li>
                  <li>İletişim formları veya yorumlar aracılığıyla diğer kullanıcılara veya sistem yöneticilerine hakaret etmek, spam mesaj göndermek.</li>
                </ul>
              </TermsSection>

              <TermsSection id="moderasyon" title="7. Moderasyon ve Denetim">
                <p>
                  Platform yönetimi, yüklenen tüm içerikleri yayınlanmadan önce veya sonra denetleme, uygun görmediği içerikleri <strong>hiçbir sebep bildirmeksizin reddetme, değiştirme veya kalıcı olarak silme</strong> hakkını saklı tutar. Yönetim, kullanıcıların platformu kullanımını izleyebilir ve gerekli durumlarda IP adreslerini engelleyebilir.
                </p>
              </TermsSection>

              <TermsSection id="sorumluluk-reddi" title="8. Sorumluluk Reddi (Disclaimer)">
                <p>
                  Platformdaki tüm materyaller kullanıcılar ("Yükleyiciler") tarafından sağlanmaktadır. Platform yönetimi, bu materyallerin akademik doğruluğunu, güncelliğini, MEB müfredatına uygunluğunu veya telif hakkı durumunu <strong>garanti etmez.</strong>
                </p>
                <p>
                  Platformdan indirilen bir materyalin sınıf ortamında kullanılmasından veya bilgisayarınıza indirilmesinden doğabilecek her türlü doğrudan veya dolaylı maddi/manevi zarardan (veri kaybı vb.) Platform sorumlu tutulamaz. Hizmet "olduğu gibi" (AS IS) sunulmaktadır.
                </p>
              </TermsSection>

              <TermsSection id="hizmet-kesintileri" title="9. Hizmet Kesintileri">
                <p>
                  Platform, altyapı güncellemeleri, Cloudflare servis bakımları veya öngörülemeyen teknik aksaklıklar (Mücbir Sebepler) nedeniyle geçici olarak erişime kapanabilir. Platform yönetimi, hizmetin kesintisiz veya hatasız olacağını taahhüt etmez.
                </p>
              </TermsSection>

              <TermsSection id="hesap-fesh" title="10. İhlaller ve Hesabın Feshi">
                <p>
                  İşbu Kullanım Koşulları'nı ihlal eden kullanıcıların hesapları, önceden haber verilmeksizin kalıcı olarak askıya alınabilir veya silinebilir. Telif hakkı ihlalleri veya siber suç teşkil eden durumlarda, Platform yönetimi yasal makamlarla (Emniyet Genel Müdürlüğü, Savcılıklar vb.) IP ve log kayıtlarını paylaşma hakkını saklı tutar.
                </p>
              </TermsSection>

              <TermsSection id="uyusmazlik" title="11. Uyuşmazlık Çözümü">
                <p>
                  Bu Kullanım Koşulları'nın yorumlanmasında ve uygulanmasında Türkiye Cumhuriyeti kanunları geçerli olacaktır. İşbu koşullardan doğabilecek her türlü ihtilafın çözümünde <strong>İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri</strong> münhasıran yetkilidir.
                </p>
              </TermsSection>

              <TermsSection id="iletisim" title="12. İletişim">
                <p>
                  Telif hakkı bildirimleri (DMCA / Uyar-Kaldır prensibi) veya Kullanım Koşulları ile ilgili sorularınız için bizimle iletişime geçebilirsiniz:
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-4 inline-block print:border-slate-300">
                  <p className="font-bold text-slate-900 m-0">Yasal Destek Birimi:</p>
                  <a href="mailto:iletisim@ogretmenbusra.com" className="text-sky-600 font-bold m-0 hover:underline">iletisim@ogretmenbusra.com</a>
                </div>
              </TermsSection>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}

function TermsSection({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 mb-12 pb-12 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0 print:border-b-0 print:mb-6 print:pb-0">
      <h2 className="text-2xl font-black text-slate-900 mb-6">{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}