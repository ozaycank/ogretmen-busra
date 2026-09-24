import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, HeartHandshake, Mail, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Destek Verenler | Büşra Öğretmen",
  description:
    "Büşra Öğretmen'e destek veren eğitim platformlarını ve ücretsiz eğitim kaynakları sunan siteleri keşfedin.",
  alternates: {
    canonical: "https://www.ogretmenbusra.com/destek-verenler",
  },
  openGraph: {
    title: "Destek Verenler | Büşra Öğretmen",
    description:
      "Büşra Öğretmen'e destek veren ve eğitimde ücretsiz paylaşım kültürüne katkı sağlayan platformlar.",
    url: "https://www.ogretmenbusra.com/destek-verenler",
    siteName: "Büşra Öğretmen",
    type: "website",
    locale: "tr_TR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const supporter = {
  name: "Doğru Plan Oluşturucu",
  url: "https://plan.dogru.app/",
  supportUrl: "https://plan.dogru.app/destek-verenler#ogretmenbusra",
  domain: "plan.dogru.app",
  subtitle: "Öğretmenler için ücretsiz plan oluşturma araçları",
  description:
    "Doğru Plan Oluşturucu; öğretmenlerin yıllık plan, günlük ders planı ve eğitim planlama süreçlerini kolaylaştırmayı amaçlayan ücretsiz ve reklamsız bir eğitim platformudur.",
  topics: ["Ders planlama", "Öğretmen araçları", "Ücretsiz kullanım", "Eğitim"],
} as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Büşra Öğretmen'e Destek Verenler",
  description: "Büşra Öğretmen'e destek veren eğitim platformları.",
  numberOfItems: 1,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: supporter.name,
      url: supporter.url,
    },
  ],
};

export default function SupportersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="min-h-screen bg-gradient-to-b from-sky-50/70 via-white to-white">
        {/* Hero */}
        <section className="border-b border-slate-200/70">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
                <HeartHandshake size={17} aria-hidden="true" />
                Eğitimde dayanışma
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Destek Verenler
              </h1>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Eğitimin paylaşarak ve dayanışmayla güçlendiğine inanıyoruz.
                Büşra Öğretmen&apos;e destek veren, öğretmenlere ücretsiz hizmet
                ve kaynak sunan değerli eğitim platformlarını bu sayfada
                paylaşıyoruz.
              </p>

            </div>
          </div>
        </section>

        {/* Destekçi */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-700">
              <Sparkles size={18} aria-hidden="true" />
              Eğitime destek veren platform
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Destekçimiz
            </h2>

            <p className="mt-2 max-w-2xl leading-7 text-slate-600">
              Eğitimde ücretsiz paylaşım kültürünü destekleyen platformlara
              teşekkür ediyoruz.
            </p>
          </div>

          <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div
              className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/80 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10 grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-3xl">
                <p className="text-xs font-bold tracking-wider text-sky-600 uppercase">
                  {supporter.domain}
                </p>

                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  {supporter.name}
                </h3>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {supporter.subtitle}
                </p>

                <p className="mt-5 leading-7 text-slate-600">
                  {supporter.description}
                </p>

                <p className="mt-4 leading-7 text-slate-600">
                  Öğretmen Büşra&apos;yı kendi{" "}
                  <strong className="font-semibold text-slate-800">
                    Destek Verenler
                  </strong>{" "}
                  sayfasında paylaşarak sitemize ve ücretsiz eğitim materyali
                  üretme anlayışımıza verdiği destek için Doğru Plan
                  Oluşturucu&apos;ya teşekkür ederiz.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {supporter.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                <a
                  href={supporter.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
                >
                  Siteyi ziyaret et
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>

                <a
                  href={supporter.supportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
                >
                  Bize verdikleri desteği gör
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>
        </section>

        {/* Açıklama */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Bu sayfa nasıl büyüyecek?
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Destek Verenler sayfasına yalnızca iletişim kurduğumuz, eğitim
                alanında ücretsiz fayda sağlayan ve karşılıklı olarak destek
                konusunda anlaştığımız platformları ekliyoruz.
              </p>

              <p className="mt-3 leading-7 text-slate-600">
                Yeni eğitim platformlarıyla iş birlikleri oluştukça bu listeyi
                güncelleyerek eğitimde paylaşım ve dayanışma ağını büyütmeyi
                hedefliyoruz.
              </p>
            </div>
          </div>
        </section>

        {/* İletişim CTA */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-7 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 font-semibold text-sky-700">
                <Mail size={18} aria-hidden="true" />
                Eğitimde birlikte büyüyelim
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Ücretsiz eğitim kaynakları sunan bir platform musunuz?
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Öğretmenlere, öğrencilere veya velilere ücretsiz eğitim içeriği
                ya da araçları sunuyorsanız ve karşılıklı destek konusunda
                iletişime geçmek istiyorsanız bize ulaşabilirsiniz.
              </p>
            </div>

            <Link
              href="/iletisim"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              İletişime geç
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
