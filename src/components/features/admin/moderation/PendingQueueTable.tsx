"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { bulkModerateMaterials } from "@/app/admin/materials/pending/actions";
import { ShieldAlert, ShieldCheck, Clock, Search, Filter, CheckCircle2, XCircle, AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import { GradeLevel, ContentCategory } from "@prisma/client";

// Sayfa sunucusundan gelecek zenginleştirilmiş materyal tipi
export type EnrichedPendingMaterial = {
  id: string;
  title: string;
  authorName: string;
  grade: string;
  category: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
  riskScore: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

interface QueueTableProps {
  materials: EnrichedPendingMaterial[];
  nextCursor: string | null;
}

export default function PendingQueueTable({ materials: initialMaterials, nextCursor }: QueueTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [modalAction, setModalAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [reason, setReason] = useState("");

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) params.set("q", term);
    else params.delete("q");
    params.delete("cursor"); // Aramada cursor sıfırlanır
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleBulkAction = async () => {
    if (!modalAction || selectedIds.size === 0) return;
    
    startTransition(async () => {
      const ids = Array.from(selectedIds);
      const res = await bulkModerateMaterials(ids, modalAction, reason);
      if (res.success) {
        setSelectedIds(new Set());
        setModalAction(null);
        setReason("");
      } else {
        alert(res.error);
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === initialMaterials.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(initialMaterials.map(m => m.id)));
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const loadMore = () => {
    if (!nextCursor) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("cursor", nextCursor);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Araç Çubuğu & Filtreler */}
      <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col xl:flex-row gap-4 justify-between items-center bg-slate-50/50">
        <div className="relative w-full xl:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Başlık, yazar veya ID ile ara..." 
            defaultValue={searchParams.get("q") || ""}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mr-2 bg-slate-900 text-white px-4 py-2 rounded-xl animate-in fade-in zoom-in-95">
              <span className="text-sm font-bold">{selectedIds.size} materyal seçili:</span>
              <button onClick={() => setModalAction("APPROVE")} className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold transition-colors">
                <CheckCircle2 size={16}/> Onayla
              </button>
              <button onClick={() => setModalAction("REJECT")} className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-500 rounded-lg text-sm font-bold transition-colors">
                <XCircle size={16}/> Reddet
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Veri Tablosu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 w-12 text-center">
                <input type="checkbox" checked={selectedIds.size === initialMaterials.length && initialMaterials.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
              </th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Materyal & Yazar</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Sınıf/Kategori</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Risk Skoru & Öncelik</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Bekleme Süresi</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialMaterials.map((item) => {
              const hoursWaiting = Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60));
              const isOverdue = hoursWaiting > 24;

              return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 text-center">
                    <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900 text-sm truncate max-w-[250px]">{item.title}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      {item.authorName} • <span className="uppercase font-mono">{item.fileType}</span> • {(item.fileSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="block font-medium text-slate-700 text-sm">{item.grade.replace("_", " ")}</span>
                    <span className="text-xs text-slate-500">{item.category.replace(/_/g, " ")}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-black text-sm border-2 ${
                        item.priority === "CRITICAL" ? "bg-rose-100 text-rose-700 border-rose-200" :
                        item.priority === "HIGH" ? "bg-amber-100 text-amber-700 border-amber-200" :
                        "bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}>
                        {item.riskScore}
                      </div>
                      <div className="flex flex-col">
                        {item.priority === "CRITICAL" && <span className="text-xs font-bold text-rose-600 flex items-center gap-1"><AlertTriangle size={12}/> Yüksek Risk</span>}
                        {item.priority === "LOW" && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><ShieldCheck size={12}/> Güvenli Profil</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isOverdue ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}`}>
                      <Clock size={12}/> {hoursWaiting > 0 ? `${hoursWaiting} saat` : "Yeni"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/materials/pending/${item.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors">
                      İncele <ChevronRight size={14}/>
                    </Link>
                  </td>
                </tr>
              );
            })}
            {initialMaterials.length === 0 && (
              <tr><td colSpan={6} className="p-12 text-center text-slate-500 font-medium">Şu an onay bekleyen materyal bulunmuyor. Her yer tertemiz! ✨</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cursor Pagination Load More */}
      {nextCursor && (
        <div className="p-4 border-t border-slate-200 flex justify-center">
          <button onClick={loadMore} className="px-6 py-2.5 bg-sky-50 text-sky-700 font-bold rounded-xl hover:bg-sky-100 transition-colors text-sm">
            Daha Fazla Yükle
          </button>
        </div>
      )}

      {/* Toplu İşlem Modalı */}
      {modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className={`text-xl font-black mb-2 ${modalAction === "APPROVE" ? "text-emerald-600" : "text-rose-600"}`}>
              {selectedIds.size} Materyali {modalAction === "APPROVE" ? "Onaylıyorsunuz" : "Reddediyorsunuz"}
            </h3>
            <p className="text-slate-500 text-sm mb-6">Bu işlem seçili tüm materyallere tek seferde (transaction) uygulanacaktır.</p>
            
            <textarea 
              value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none mb-6 resize-none"
              rows={3} placeholder="Toplu işlem notu (Opsiyonel)"
            />

            <div className="flex gap-3 justify-end">
              <button onClick={() => setModalAction(null)} disabled={isPending} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">İptal</button>
              <button onClick={handleBulkAction} disabled={isPending} className={`flex items-center gap-2 px-5 py-2.5 font-bold text-white rounded-xl ${modalAction === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}>
                {isPending ? <Loader2 className="animate-spin" size={18} /> : "Uygula"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}