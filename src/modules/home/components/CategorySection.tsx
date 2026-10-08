import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Gamepad2,
  PenTool,
  Lightbulb,
  Code,
  Award,
} from "lucide-react";

const POPULAR_CATEGORIES = [
  {
    key: "ETKINLIK",
    label: "Sınıf Etkinlikleri",
    icon: PenTool,
    color: "text-rose-500",
    bg: "bg-rose-50",
    hover: "hover:border-rose-200",
  },
  {
    key: "INTERAKTIF_OYUN",
    label: "İnteraktif Oyunlar",
    icon: Gamepad2,
    color: "text-sky-500",
    bg: "bg-sky-50",
    hover: "hover:border-sky-200",
  },
  {
    key: "ODEV",
    label: "Hafta Sonu Ödevleri",
    icon: BookOpen,
    color: "text-amber-500",
    bg: "bg-amber-50",
    hover: "hover:border-amber-200",
  },
  {
    key: "KODLAMA",
    label: "Bilişim ve Kodlama",
    icon: Code,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    hover: "hover:border-emerald-200",
  },
  {
    key: "DEGERLER_EGITIMI",
    label: "Değerler Eğitimi",
    icon: Lightbulb,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    hover: "hover:border-indigo-200",
  },
  {
    key: "BELIRLI_GUN_VE_HAFTALAR",
    label: "Belirli Gün ve Haftalar",
    icon: Award,
    color: "text-purple-500",
    bg: "bg-purple-50",
    hover: "hover:border-purple-200",
  },
] as const;

export default function CategorySection() {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Popüler Kategoriler
          </h2>

          <p className="mt-1 text-slate-500">
            İhtiyacınız olan materyale hızlıca ulaşın.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {POPULAR_CATEGORIES.map((category) => (
          <Link
            key={category.key}
            href={`/materyaller?category=${category.key}`}
            prefetch={false}
            className={`flex flex-col items-center rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${category.hover}`}
          >
            <div
              className={`mb-4 rounded-2xl p-4 ${category.bg} ${category.color}`}
            >
              <category.icon size={28} />
            </div>

            <span className="text-sm font-bold text-slate-800">
              {category.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
