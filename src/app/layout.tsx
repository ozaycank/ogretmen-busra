import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 text-gray-900`}>
        <Navbar />
        
        {/* Ana içerik alanı - Skeletonlar zaten loading.tsx'ler üzerinden gelecek */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}