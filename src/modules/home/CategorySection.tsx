import React from "react";
import Link from "next/link";
import { BookOpen, Gamepad2, PenTool, Lightbulb, Code, Award } from "lucide-react";

// Şemadaki ContentCategory enum'ı ile eşleşen popüler kategoriler
const POPULAR_CATEGORIES = [
  { key: "ETKINLIK", label: "Sınıf Etkinlikleri", icon: PenTool, color: "text-rose-500", bg: "bg-rose-50", hover: "hover:border-rose-200" },
  { key: "INTERAKTIF_OYUN", label: "İnteraktif Oyunlar", icon: Gamepad2, color: "text-sky-500", bg: "bg-sky-50", hover: "hover:border-sky-200" },
  { key: "ODEV", label: "Hafta Sonu Ödevleri", icon: BookOpen, color: "text-amber-500", bg: "bg-amber-50", hover: "hover:border-amber-200" },
  { key: "KODLAMA", label: "Bilişim ve Kodlama", icon: Code, color: "text-emerald-500", bg: "bg-emerald-50", hover: "hover:border-emerald-200" },
  { key: "DEGERLER_EGITIMI", label: "Değerler Eğitimi", icon: Lightbulb, color: "text-indigo-500", bg: "bg-indigo-50", hover: "hover:border-indigo-200" },
  { key: "BELIRLI_GUN_VE_HAFTALAR", label: "Belirli Gün ve Haftalar", icon: Award, color: "text-purple-500", bg: "bg-purple-50", hover: "hover:border-purple-200" },
];

export default function CategorySection() {
  return (
    <section className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Popüler Kategoriler</h2>
          <p className="text-slate-500 mt-1">İhtiyacınız olan materyale hızlıca ulaşın.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {POPULAR_CATEGORIES.map((category) => (
          <Link
            key={category.key}
            href={`/materyaller?category=${category.key}`}
            className={`flex flex-col items-center text-center p-6 rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1 ${category.hover}`}
          >
            <div className={`p-4 rounded-2xl ${category.bg} ${category.color} mb-4`}>
              <category.icon size={28} />
            </div>
            <span className="font-bold text-slate-800 text-sm">{category.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}