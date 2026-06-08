import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telif Hakkı ve Yasal Uyarı | Platform",
  description: "Platformumuzun telif hakları, içerik mülkiyeti ve yasal sorumluluk red beyanı hakkında bilgilendirme sayfası.",
  alternates: {
    canonical: "/telif",
  },
};

export default function CopyrightPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 min-h-screen">
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 lg:p-12">
        <header className="mb-10 text-center sm:text-left border-b border-gray-100 pb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            Telif Hakkı ve Yasal Uyarı
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            Son Güncelleme: {new Date().toLocaleDateString("tr-TR")}
          </p>
        </header>

        <div className="space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              1. Fikri Mülkiyet ve İçerik Sahipliği
            </h2>
            <p className="mb-4">
              Bu platformda yer alan tüm metinler, grafikler, logolar, ses dosyaları, yazılımlar, görsel ve işitsel materyaller ile bunların sunumu, dizilimi ve platformun genel tasarımı dahil olmak üzere tüm içeriklerin fikri mülkiyet hakları Platform Yönetimi'ne veya içerik sağlayıcılarına aittir.
            </p>
            <p>
              Kullanıcılar tarafından platforma yüklenen, paylaşılan veya sunulan her türlü içeriğin yasal sorumluluğu içeriği yükleyen kullanıcıya aittir. Kullanıcılar, yalnızca telif haklarına sahip oldukları veya yasal olarak paylaşım iznine sahip oldukları materyalleri yüklemeyi kabul ederler.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              2. Telif Hakkı İhlali Bildirimi (DMCA Prosedürü)
            </h2>
            <p className="mb-4">
              Platformumuz, 5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi Hakkında Kanun uyarınca "yer sağlayıcı" olarak faaliyet göstermektedir. Sistemimizdeki içeriklerin hukuka aykırı olup olmadığını kontrol etme yükümlülüğümüz bulunmamaktadır.
            </p>
            <p className="mb-4">
              Eğer platformumuzda yer alan herhangi bir içeriğin size veya temsil ettiğiniz bir kuruma ait telif haklarını ihlal ettiğini düşünüyorsanız, içerik kaldırma taleplerinizi aşağıdaki yasal formatta bize iletebilirsiniz. Başvurunuz en geç 3 (üç) iş günü içerisinde incelenerek gerekli adımlar atılacaktır.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 border border-gray-200">
              <p className="font-semibold mb-2">Telif hakkı bildiriminde bulunması gerekenler:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Hak sahibi olduğunuzu kanıtlayan belge veya beyan,</li>
                <li>İhlale konu olan içeriğin tam URL adresi,</li>
                <li>Adınız, soyadınız, e-posta adresiniz ve iletişim numaranız,</li>
                <li>"Verdiğim bilgilerin doğru olduğunu ve şikayete konu içeriğin hak sahibi tarafından izin verilmediğini beyan ederim" şeklinde ıslak veya elektronik imzalı yazılı beyan.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              3. Yasal Sorumluluk Reddi
            </h2>
            <p className="mb-4">
              Platformumuzda sunulan içerikler tamamen "olduğu gibi" (as is) esasına göre sağlanmaktadır. Platform Yönetimi, içeriklerin doğruluğu, güncelliği, eksiksizliği, belirli bir amaca uygunluğu veya telif haklarını ihlal etmediği konusunda açık veya zımni hiçbir garanti vermez.
            </p>
            <p>
              Platformun kullanımı sonucunda doğabilecek doğrudan, dolaylı, özel veya cezai zararlardan, veri kayıplarından veya iş kesintilerinden Platform Yönetimi, çalışanları veya iş ortakları sorumlu tutulamaz. Dış bağlantılar (linkler) üzerinden erişilen üçüncü taraf sitelerin içeriklerinden platformumuz sorumlu değildir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              4. İletişim ve Bildirimler
            </h2>
            <p>
              Her türlü telif hakkı ihlali bildirimi, yasal talep ve şikayetleriniz için aşağıdaki iletişim kanallarını kullanabilirsiniz:
            </p>
            <div className="mt-4 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
              <p className="font-medium text-gray-900">Yasal İletişim E-Posta Adresi:</p>
              <a 
                href="mailto:iletisim@ogretmenbusra.com" 
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                iletisim@ogretmenbusra.com
              </a>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}