import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Bileşen importları
import Navbar from "@/shared/layout/Navbar";
import Footer from "@/shared/layout/Footer";

// YENİ EKLENEN: Cookie Provider importu
import { CookieProvider } from "@/shared/providers/CookieProvider";

const inter = Inter({ subsets: ["latin"] });

// ÇÖZÜM: metadataBase ve dinamik title template eklendi
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ogretmenbusra.com"),
  title: {
    default: "Büşra Öğretmen | Eğitim Materyalleri ve Etkinlik Deposu",
    template: "%s | Büşra Öğretmen",
  },
  description: "Öğretmenler, öğrenciler ve veliler için ücretsiz etkinlik, ödev, konu anlatımı ve eğitim materyalleri arşivi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        {/* Tüm uygulamayı CookieProvider ile sarmalıyoruz */}
        <CookieProvider>
          
          <Navbar />
          
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          
          <Footer />

        </CookieProvider>
      </body>
    </html>
  );
}