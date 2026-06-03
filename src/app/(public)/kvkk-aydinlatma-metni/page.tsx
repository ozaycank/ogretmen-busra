import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Scale } from "lucide-react";
import PrintButton from "@/components/ui/PrintButton";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Büşra Öğretmen",
  description: "Büşra Öğretmen eğitim platformu 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki aydınlatma metni ve kullanıcı hakları.",
  openGraph: {
    title: "KVKK Aydınlatma Metni | Büşra Öğretmen",
    description: "Kişisel verilerinizin hangi hukuki gerekçelerle ve nasıl işlendiğini öğrenin.",
    type: "website",
    url: "https://ogretmenbusra.com/kvkk-aydinlatma-metni",
  }
};

const KVKK_SECTIONS = [
  { id: "veri-sorumlusu", title: "1. Veri Sorumlusunun Kimliği" },
  { id: "islenen-veriler", title: "2. İşlenen Kişisel Verileriniz" },
  { id: "islenme-amaci", title: "3. İşlenme Amaçları" },
  { id: "hukuki-sebepler", title: "4. İşlemenin Hukuki Sebepleri" },
  { id: "veri-aktarimi", title: "5. Kişisel Verilerin Aktarımı" },
  { id: "saklama-suresi", title: "6. Veri Saklama Süreleri" },
  { id: "ilgili-kisi-haklari", title: "7. İlgili Kişinin Hakları (Madde 11)" },
  { id: "basvuru-yontemi", title: "8. Başvuru Yöntemi ve İletişim" },
];

export default function KVKKPage() {
  const lastUpdated = "1 Haziran 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://ogretmenbusra.com/kvkk-aydinlatma-metni",
        "url": "https://ogretmenbusra.com/kvkk-aydinlatma-metni",
        "name": "KVKK Aydınlatma Metni | Büşra Öğretmen",
        "dateModified": new Date("2026-06-01").toISOString(),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "https://ogretmenbusra.com" },
          { "@type": "ListItem", "position": 2, "name": "KVKK Aydınlatma Metni", "item": "https://ogretmenbusra.com/kvkk-aydinlatma-metni" }
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
              <span className="text-slate-900">KVKK Aydınlatma Metni</span>
            </nav>
            <PrintButton />
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/50 text-slate-700 text-sm font-bold mb-4 print:hidden">
              <ShieldCheck size={16} className="text-indigo-600" />
              <span>Aydınlatma Yükümlülüğü</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">KVKK Aydınlatma Metni</h1>
            <p className="text-slate-500 mt-3 text-lg">Son Güncelleme: {lastUpdated}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <aside className="lg:col-span-3 xl:col-span-3 print:hidden">
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm sticky top-24 w-full">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Scale size={18} className="text-indigo-500" />
                İçindekiler
              </h2>
              <nav className="space-y-1 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                {KVKK_SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors leading-snug break-words"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-9 xl:col-span-9 w-full min-w-0 bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm print:border-none print:shadow-none print:p-0">
            <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-sky-600 prose-li:text-slate-600">
              
              <p className="lead text-lg text-slate-700 font-medium">
                Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK") 10. maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ kapsamında hazırlanmıştır.
              </p>

              <KVKKSection id="veri-sorumlusu" title="1. Veri Sorumlusunun Kimliği">
                <p>
                  Büşra Öğretmen Eğitim Platformu ("Platform") olarak, kullanıcılarımızın kişisel verilerini 6698 sayılı KVKK kapsamında "Veri Sorumlusu" sıfatıyla, aşağıda açıklanan amaçlar ve sınırlar çerçevesinde işlemekteyiz.
                </p>
              </KVKKSection>

              <KVKKSection id="islenen-veriler" title="2. İşlenen Kişisel Verileriniz">
                <p>Platformumuzu kullanımınıza bağlı olarak aşağıdaki kişisel veri kategorileri işlenmektedir:</p>
                <ul>
                  <li><strong>Kimlik Bilgileri:</strong> Ad, soyad (İletişim formunu kullanmanız veya materyal yüklerken "Yazar" olarak belirtmeniz halinde).</li>
                  <li><strong>İletişim Bilgileri:</strong> E-posta adresi.</li>
                  <li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi logları (kriptografik özetleme/hashing ile), erişim tarih/saat bilgileri, tarayıcı ve cihaz bilgileri (User-Agent).</li>
                  <li><strong>Kullanıcı İçerikleri:</strong> Platforma yüklediğiniz eğitim materyallerinin içerikleri (kendi inisiyatifinizle eklediğiniz kişisel veriler).</li>
                </ul>
              </KVKKSection>

              <KVKKSection id="islenme-amaci" title="3. Kişisel Verilerin İşlenme Amaçları">
                <p>Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                <ul>
                  <li>Eğitim materyallerinin güvenli bir şekilde sisteme yüklenmesi ve yayınlanması süreçlerinin yürütülmesi,</li>
                  <li>Yüklenen dosyalarda yazar isminin belirtilmesi yoluyla telif ve mülkiyet haklarının korunması,</li>
                  <li>5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi Hakkında Kanun'dan doğan yasal yükümlülüklerin yerine getirilmesi,</li>
                  <li>Siber saldırıların, spam materyal yüklemelerinin ve bot aktivitelerinin (Cloudflare Turnstile aracılığıyla) tespit edilerek engellenmesi,</li>
                  <li>İletişim formu aracılığıyla gelen soru, talep ve şikayetlerin yanıtlanması.</li>
                </ul>
              </KVKKSection>

              <KVKKSection id="hukuki-sebepler" title="4. İşlemenin Hukuki Sebepleri">
                <p>Kişisel verileriniz, KVKK'nın 5. maddesinde belirtilen aşağıdaki hukuki sebeplere dayanılarak tamamen veya kısmen otomatik yollarla (sunucu kayıtları, web formları) elde edilmektedir:</p>
                <ul>
                  <li><strong>Madde 5/2-c:</strong> Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması (Kullanım Koşulları'nın kabulü).</li>
                  <li><strong>Madde 5/2-ç:</strong> Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması (5651 Sayılı Kanun log tutma zorunluluğu).</li>
                  <li><strong>Madde 5/2-e:</strong> Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması.</li>
                  <li><strong>Madde 5/2-f:</strong> İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması (Sistem güvenliğinin sağlanması).</li>
                </ul>
              </KVKKSection>

              <KVKKSection id="veri-aktarimi" title="5. Kişisel Verilerin Aktarımı">
                <p>Kişisel verileriniz kural olarak üçüncü taraflara satılmaz veya pazarlama amacıyla paylaşılmaz. Ancak aşağıdaki durumlarda yurt içine veya yurt dışına aktarım yapılabilir:</p>
                <ul>
                  <li><strong>Yetkili Kamu Kurumları:</strong> Yasal bir uyuşmazlık veya mahkeme kararı durumunda, talep edilmesi halinde yetkili adli veya idari makamlarla (Siber Suçlarla Mücadele Daire Başkanlığı vb.) paylaşılabilir.</li>
                  <li><strong>Yurt Dışı Altyapı Sağlayıcıları:</strong> Sitenin kesintisiz hizmet vermesi ve yüklediğiniz büyük dosyaların (PDF, ZIP) güvenle barındırılması için global altyapı sağlayıcısı <strong>Cloudflare R2</strong> hizmeti kullanılmaktadır. Bu bağlamda, sisteme yüklenen dosyalar ve güvenlik logları Cloudflare'in yurt dışındaki (Avrupa Birliği) veri merkezlerinde, GDPR ve KVKK standartlarında uygulanan yeterli koruma tedbirleriyle saklanmaktadır.</li>
                </ul>
              </KVKKSection>

              <KVKKSection id="saklama-suresi" title="6. Veri Saklama Süreleri">
                <p>
                  Kişisel verileriniz, ilgili yasal mevzuatta belirtilen süreler (örneğin trafik logları 5651 sayılı kanun gereği 2 yıl) boyunca veya işlenme amacı ortadan kalkana dek saklanır. İşlenme amacı sona eren veya yasal saklama süresi dolan verileriniz, veri imha politikamız gereği periyodik olarak silinir, yok edilir veya anonim hale getirilir.
                </p>
              </KVKKSection>

              <KVKKSection id="ilgili-kisi-haklari" title="7. İlgili Kişinin Hakları (KVKK Madde 11)">
                <p>KVKK'nın 11. maddesi uyarınca veri sahibi (ilgili kişi) olarak aşağıdaki haklara sahipsiniz:</p>
                <ul>
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                  <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
                  <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                  <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
                  <li>Verilerin eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme,</li>
                  <li>KVKK 7. maddesinde öngörülen şartlar çerçevesinde verilerin silinmesini veya yok edilmesini isteme,</li>
                  <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
                  <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme.</li>
                </ul>
              </KVKKSection>

              <KVKKSection id="basvuru-yontemi" title="8. Başvuru Yöntemi ve İletişim">
                <p>
                  Yukarıda belirtilen haklarınızı kullanmakla ilgili taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ'e uygun olarak iletebilirsiniz. 
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-4 inline-block print:border-slate-300">
                  <p className="font-bold text-slate-900 m-0 mb-2">Başvuru Kanalları:</p>
                  <ul className="m-0 p-0 list-none space-y-2">
                    <li className="flex items-center gap-2 m-0">
                      <span className="font-medium">E-posta:</span>
                      <a href="mailto:iletisim@ogretmenbusra.com" className="text-sky-600 font-bold m-0 hover:underline">iletisim@ogretmenbusra.com</a>
                    </li>
                    <li className="flex items-center gap-2 m-0">
                      <span className="font-medium">Web Formu:</span>
                      <Link href="/iletisim" className="text-sky-600 font-bold m-0 hover:underline">İletişim Sayfası</Link>
                    </li>
                  </ul>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Talepleriniz, talebin niteliğine göre en kısa sürede ve en geç otuz (30) gün içinde ücretsiz olarak sonuçlandırılacaktır.
                </p>
              </KVKKSection>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}

function KVKKSection({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 mb-12 pb-12 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0 print:border-b-0 print:mb-6 print:pb-0">
      <h2 className="text-2xl font-black text-slate-900 mb-6">{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}