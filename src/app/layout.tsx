import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Bileşen importları
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// YENİ EKLENEN: Cookie Provider importu
import { CookieProvider } from "@/providers/CookieProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Büşra Öğretmen | Eğitim Materyalleri ve Etkinlik Deposu",
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
        {/* YENİ EKLENEN: Tüm uygulamayı CookieProvider ile sarmalıyoruz */}
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