import { Metadata } from "next";
import FaqAccordion from "./FaqAccordion";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular | Platform",
  description: "Platformumuz hakkında merak ettiğiniz soruların cevapları.",
};

export default function FaqPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
          Sıkça Sorulan Sorular
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Aklınıza takılan tüm soruların cevaplarını aşağıda bulabilirsiniz.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <FaqAccordion />
      </div>
    </main>
  );
}