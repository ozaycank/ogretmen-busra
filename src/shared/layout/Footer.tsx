import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { Activity, Calendar, Database, Users } from "lucide-react";

import { AnalyticsService } from "@/modules/analytics/services/analytics.service";

const MIN_TOTAL_VISITS_TO_SHOW = 1000;

const EMPTY_STATS = {
  online: 0,
  today: 0,
  yesterday: 0,
  total: 0,
};

const getCachedGlobalStats = unstable_cache(
  async () => AnalyticsService.getGlobalStats(),
  ["footer-global-stats"],
  {
    revalidate: 60,
  },
);

const platformLinks = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/materyaller", label: "Tüm Materyaller" },
  { href: "/haberler", label: "Eğitim Haberleri" },
  { href: "/destek-verenler", label: "Destek Verenler" },
  { href: "/sss", label: "S.S.S." },
] as const;

const legalLinks = [
  { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
  { href: "/gizlilik", label: "Gizlilik Politikası" },
  { href: "/kvkk-aydinlatma-metni", label: "KVKK" },
  { href: "/cerezler", label: "Çerez Tercihleri" },
  { href: "/telif", label: "Telif Hakkı Uyarısı" },
] as const;

async function getFooterStats() {
  try {
    return await getCachedGlobalStats();
  } catch (error) {
    console.error("[FOOTER_STATS_ERROR] İstatistikler çekilemedi:", error);

    return EMPTY_STATS;
  }
}

export default async function Footer() {
  const stats = await getFooterStats();

  const isStatsVisible = stats.total >= MIN_TOTAL_VISITS_TO_SHOW;

  return (
    <footer
      className="mt-auto border-t border-slate-800/50 bg-[#0f172a] pt-12 pb-6 text-gray-300"
      aria-label="Site alt bilgisi"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isStatsVisible && (
          <section
            aria-label="Site ziyaret istatistikleri"
            className="relative mb-10 grid grid-cols-2 gap-4 overflow-hidden rounded-2xl border border-slate-800 bg-[#1e293b] p-6 shadow-lg md:grid-cols-4"
          >
            <div
              className="absolute top-0 right-0 h-32 w-32 rounded-full bg-sky-500/5 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10 flex items-center justify-center gap-3 border-r border-slate-800/50 md:justify-start">
              <div className="relative rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <span
                  className="absolute top-1 right-1 h-2 w-2 animate-ping rounded-full bg-emerald-500 motion-reduce:animate-none"
                  aria-hidden="true"
                />

                <Activity size={20} aria-hidden="true" />
              </div>

              <div>
                <p className="text-xl font-bold tracking-tight text-white">
                  {stats.online.toLocaleString("tr-TR")}
                </p>

                <p className="text-xs font-medium text-slate-400">Çevrimiçi</p>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-center gap-3 md:justify-start md:border-r md:border-slate-800/50">
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
                <Calendar size={20} aria-hidden="true" />
              </div>

              <div>
                <p className="text-xl font-bold tracking-tight text-white">
                  {stats.today.toLocaleString("tr-TR")}
                </p>

                <p className="text-xs font-medium text-slate-400">Bugün</p>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-center gap-3 border-r border-slate-800/50 md:justify-start">
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                <Users size={20} aria-hidden="true" />
              </div>

              <div>
                <p className="text-xl font-bold tracking-tight text-white">
                  {stats.yesterday.toLocaleString("tr-TR")}
                </p>

                <p className="text-xs font-medium text-slate-400">Dün</p>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-center gap-3 md:justify-start">
              <div className="rounded-xl bg-sky-500/10 p-3 text-sky-400">
                <Database size={20} aria-hidden="true" />
              </div>

              <div>
                <p className="text-xl font-bold tracking-tight text-white">
                  {stats.total.toLocaleString("tr-TR")}
                </p>

                <p className="text-xs font-medium text-slate-400">
                  Toplam Ziyaret
                </p>
              </div>
            </div>
          </section>
        )}

        <div
          className={`grid grid-cols-1 gap-8 md:grid-cols-12 ${
            isStatsVisible ? "border-t border-slate-800/50 pt-10" : ""
          }`}
        >
          <div className="md:col-span-12 lg:col-span-6">
            <div className="mb-3 flex items-center gap-3">
              <Image
                src="/ogretmenbusraicon.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
                aria-hidden="true"
              />

              <p className="text-xl font-bold tracking-wide text-white">
                Büşra Öğretmen
              </p>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Türkiye&apos;nin dört bir yanındaki öğretmenler, öğrenciler ve
              veliler için ücretsiz, güvenilir ve nitelikli eğitim materyalleri
              deposu.
            </p>
          </div>

          <nav
            className="md:col-span-6 lg:col-span-3"
            aria-label="Platform bağlantıları"
          >
            <h2 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">
              Platform
            </h2>

            <ul className="space-y-3 text-sm font-medium text-slate-400">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-sky-400 focus-visible:text-sky-400 focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            className="md:col-span-6 lg:col-span-3"
            aria-label="Yasal bağlantılar"
          >
            <h2 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">
              Yasal
            </h2>

            <ul className="space-y-3 text-sm font-medium text-slate-400">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-sky-400 focus-visible:text-sky-400 focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-800/50 pt-6 text-xs text-slate-500 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} ogretmenbusra.com. Tüm hakları
            saklıdır.
          </p>

          <div className="mt-4 flex flex-col items-center gap-3 font-medium md:mt-0 md:flex-row">
            <span>Developed with ❤️ for Education</span>

            <span
              className="hidden h-1 w-1 rounded-full bg-slate-700 md:block"
              aria-hidden="true"
            />

            <a
              href="https://github.com/ozaycank"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 transition-colors hover:text-sky-400 focus-visible:text-sky-400 focus-visible:outline-none"
              title="Özay Can Kırlı - GitHub"
            >
              <span>Özay Can Kırlı</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
