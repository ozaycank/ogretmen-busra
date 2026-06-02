import React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Plus, Edit3, Trash2, Globe, Clock } from "lucide-react";
import NewsEditor from "@/components/features/admin/news/NewsEditor";

export const metadata: Metadata = {
  title: "Haber Yönetimi | Admin",
};

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  const { action } = await searchParams;

  // URL'de ?action=new varsa Editör ekranını göster
  if (action === "new") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Yeni Haber Ekle</h1>
          <Link href="/admin/news" className="px-5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Vazgeç</Link>
        </div>
        <NewsEditor />
      </div>
    );
  }

  // Liste Ekranı
  const newsList = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Haber ve Duyurular</h1>
          <p className="text-slate-500 mt-1">Platformdaki eğitim haberlerini buradan yönetin.</p>
        </div>
        <Link href="/admin/news?action=new" className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-colors shadow-sm">
          <Plus size={20} /> Yeni Ekle
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Haber Başlığı</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durum</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Görüntülenme</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {newsList.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4">
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock size={12}/> {new Date(item.createdAt).toLocaleDateString("tr-TR")} • {item.label}
                  </p>
                </td>
                <td className="p-4">
                  {item.status === "PUBLISHED" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200"><Globe size={12}/> Yayında</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200"><Clock size={12}/> Taslak</span>
                  )}
                </td>
                <td className="p-4 text-slate-600 font-medium">
                  {item.viewCount.toLocaleString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Gerçek projede Editör component'ine ID paslanarak Edit sayfası açılır */}
                    <button className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"><Edit3 size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            
            {newsList.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  Henüz haber eklenmemiş.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}