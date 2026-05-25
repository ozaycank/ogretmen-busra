import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Tailwind CSS'in dahil olduğu global stil dosyası

// Bileşen importları
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SkeletonCard from "@/components/Skeleton";

// Türkçe karakter destekli font optimizasyonu
const inter = Inter({ subsets: ["latin"] });

// Projenin genel SEO ve Meta etiket ayarları
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
      {/* min-h-screen ve flex-col: İçerik az olsa bile Footer'ın her zaman 
        sayfanın en altında kalmasını sağlayan optimal CSS kurgusu.
      */}
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 text-gray-900`}>
        <Navbar />
        <div className="space-y-12">
      {/* Hero Alanı Skeleton (Dikkat dağıtmayacak şekilde sade bir pulse) */}
      <div className="w-full h-48 bg-gray-200 rounded-[2.5rem] animate-pulse" />

      {/* İçerik Grid Skeleton */}
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Kullanıcıya yükleniyor hissini vermek için 6 adet iskelet kart */}
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
        {/* Ana içerik alanı (Sayfalar buraya render edilir) */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}
