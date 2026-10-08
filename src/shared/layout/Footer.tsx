import Image from "next/image";
import Link from "next/link";

import FooterStats from "@/shared/layout/FooterStats";

const platformLinks = [
  {
    href: "/hakkimizda",
    label: "Hakkımızda",
  },
  {
    href: "/iletisim",
    label: "İletişim",
  },
  {
    href: "/materyaller",
    label: "Tüm Materyaller",
  },
  {
    href: "/haberler",
    label: "Eğitim Haberleri",
  },
  {
    href: "/destek-verenler",
    label: "Destek Verenler",
  },
  {
    href: "/sss",
    label: "S.S.S.",
  },
] as const;

const legalLinks = [
  {
    href: "/kullanim-kosullari",
    label: "Kullanım Koşulları",
  },
  {
    href: "/gizlilik",
    label: "Gizlilik Politikası",
  },
  {
    href: "/kvkk-aydinlatma-metni",
    label: "KVKK",
  },
  {
    href: "/cerezler",
    label: "Çerez Tercihleri",
  },
  {
    href: "/telif",
    label: "Telif Hakkı Uyarısı",
  },
] as const;

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t border-slate-800/50 bg-[#0f172a] pt-12 pb-6 text-gray-300"
      aria-label="Site alt bilgisi"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FooterStats />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
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
                    prefetch={false}
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
                    prefetch={false}
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
            <span>Eğitim için ❤️ ile geliştirildi. </span>

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
