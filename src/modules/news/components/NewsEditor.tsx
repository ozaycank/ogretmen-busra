"use client";

import React, { useState, useEffect, useCallback } from "react";
import { saveNews } from "@/app/admin/(protected)/news/actions";
import { Save, Eye, LayoutTemplate, Settings, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { News } from "@prisma/client";

const generateSlug = (text: string) => {
  return text.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-') // Tüm boşlukları ve özel karakterleri tireye çevir
    .replace(/^-+|-+$/g, ''); // Baş ve sondaki tireleri temizle
};

interface NewsEditorProps {
  initialData?: Partial<News> | null; // 🚀 DÜZELTME: 'any' kaldırıldı
}

export default function NewsEditor({ initialData }: NewsEditorProps) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(initialData?.id || null);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    label: initialData?.label || "GÜNDEM",
    imageUrl: initialData?.imageUrl || "",
    content: initialData?.content || "",
    status: initialData?.status || "DRAFT",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activeTab, setActiveTab] = useState<"editor" | "seo">("editor");

  const updateField = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "title" && !id && !initialData) {
        updated.slug = generateSlug(value); // Başlık yazılırken slug'ı otomatik doldur
      }
      return updated;
    });
  };

  const handleSave = useCallback(async (isAutoSave = false) => {
    if (formData.title.length < 5 || formData.content.length < 20) return;
    
    setSaveStatus("saving");
    const res = await saveNews(id, formData as any);
    
    if (res.success) {
      if (!id && res.id) setId(res.id); 
      setSaveStatus("saved");
      if (!isAutoSave) router.push("/admin/news");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("error");
    }
  }, [formData, id, router]);

  useEffect(() => {
    if (formData.status !== "DRAFT" || !formData.title || !formData.content) return;
    const timer = setTimeout(() => handleSave(true), 15000);
    return () => clearTimeout(timer);
  }, [formData, handleSave]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <div className="flex gap-4">
              <button onClick={() => setActiveTab("editor")} className={`font-bold flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === "editor" ? "bg-sky-50 text-sky-700" : "text-slate-500 hover:bg-slate-50"}`}><LayoutTemplate size={18}/> İçerik</button>
              <button onClick={() => setActiveTab("seo")} className={`font-bold flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === "seo" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}><Settings size={18}/> SEO Ayarları</button>
            </div>
          </div>

          {activeTab === "editor" ? (
            <div className="space-y-5">
              <input type="text" value={formData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Haber Başlığı" className="w-full text-2xl font-black text-slate-900 border-none focus:ring-0 placeholder:text-slate-300 p-0" />
              <input type="text" value={formData.slug} onChange={(e) => updateField("slug", generateSlug(e.target.value))} placeholder="url-uzantisi-slug" className="w-full text-sm font-mono text-sky-600 bg-sky-50 p-2 rounded-lg border border-sky-100 focus:outline-none" />
              <textarea value={formData.content} onChange={(e) => updateField("content", e.target.value)} placeholder="Haberin içeriğini yazmaya başlayın..." className="w-full min-h-[400px] text-slate-700 border-none focus:ring-0 placeholder:text-slate-300 p-0 resize-y" />
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Meta Başlık (Maks 60 Karakter)</label>
                <input type="text" value={formData.seoTitle} onChange={(e) => updateField("seoTitle", e.target.value)} className="w-full border border-slate-200 rounded-xl p-3" maxLength={60} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Meta Açıklama (Maks 160 Karakter)</label>
                <textarea value={formData.seoDescription} onChange={(e) => updateField("seoDescription", e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 resize-none" rows={3} maxLength={160} />
              </div>
              
              <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Google Arama Önizlemesi</p>
                <div className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer truncate">{formData.seoTitle || formData.title || "Başlık"}</div>
                <div className="text-[14px] text-[#006621] truncate">ogretmenbusra.com/haberler/{formData.slug || "url"}</div>
                <div className="text-[14px] text-[#545454] mt-1 line-clamp-2">{formData.seoDescription || formData.content.substring(0, 150) || "Açıklama girilmedi."}</div>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900">Yayın Durumu</h3>
            {saveStatus === "saving" && <span className="flex items-center gap-1 text-xs font-bold text-sky-600"><Loader2 size={14} className="animate-spin"/> Kaydediliyor</span>}
            {saveStatus === "saved" && <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={14}/> Kaydedildi</span>}
          </div>

          <select value={formData.status} onChange={(e) => updateField("status", e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700">
            <option value="DRAFT">Taslak Olarak Tut</option>
            <option value="PUBLISHED">Hemen Yayınla</option>
            <option value="ARCHIVED">Arşivle</option>
          </select>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Kategori Etiketi</label>
            <select value={formData.label} onChange={(e) => updateField("label", e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700">
              <option value="MEB">MEB</option>
              <option value="ATAMA">ATAMA</option>
              <option value="GÜNDEM">GÜNDEM</option>
              <option value="MAAŞ">MAAŞ</option>
              <option value="DUYURU">DUYURU</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Kapak Görseli URL</label>
            <input type="text" value={formData.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} placeholder="https://..." className="w-full border border-slate-200 rounded-xl p-3 text-sm" />
          </div>

          <div className="pt-4 flex gap-3">
            <button className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <Eye size={18}/> Önizle
            </button>
            <button onClick={() => handleSave(false)} className="flex-1 px-4 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-md">
              <Save size={18}/> {formData.status === "PUBLISHED" ? "Yayınla" : "Kaydet"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}