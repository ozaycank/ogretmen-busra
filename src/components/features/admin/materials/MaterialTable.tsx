"use client";

import React, { useState, useTransition } from "react";
import { updateMaterialStatus } from "@/app/admin/materials/actions";
import { Material, FileStatus } from "@prisma/client";
import { CheckCircle2, XCircle, MoreVertical, Search, Filter, Trash2, Loader2, Download } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface MaterialTableProps {
  materials: Material[];
  totalCount: number;
}

const statusColors: Record<string, string> = {
  UPLOAD_PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-100 text-blue-700 border-blue-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
  ORPHANED: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function MaterialTable({ materials: initialMaterials, totalCount }: MaterialTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Optimistic UI State (Sunucuyu beklemeden arayüzü anında güncellemek için)
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  // Arama İşlemi (Debounced)
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) params.set("q", term);
    else params.delete("q");
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Tekil Durum Güncelleme (Approve / Reject)
  const handleStatusChange = async (id: string, newStatus: FileStatus) => {
    // 1. Optimistic Update (Arayüzü anında değiştir)
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    
    // 2. Arka plan işlemi (Server Action)
    startTransition(async () => {
      const res = await updateMaterialStatus(id, newStatus);
      if (!res.success) {
        // Hata olursa eski haline döndür
        setMaterials(initialMaterials);
        alert(res.error);
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === materials.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(materials.map(m => m.id)));
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Tablo Araç Çubuğu (Toolbar) */}
      <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4 items-center bg-slate-50/50">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Dosya adı, yazar veya ID ara..." 
            defaultValue={searchParams.get("q") || ""}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mr-2 animate-in fade-in slide-in-from-right-4">
              <span className="text-sm font-bold text-slate-600">{selectedIds.size} seçili</span>
              <button className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100" title="Toplu Onayla">
                <CheckCircle2 size={18} />
              </button>
              <button className="p-2 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100" title="Toplu Reddet">
                <Trash2 size={18} />
              </button>
            </div>
          )}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
            <Filter size={16} /> Filtrele
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
            <Download size={16} /> Dışa Aktar
          </button>
        </div>
      </div>

      {/* Veri Tablosu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 w-12 text-center">
                <input type="checkbox" checked={selectedIds.size === materials.length && materials.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
              </th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Materyal & Yazar</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sınıf & Kategori</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durum</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tarih</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materials.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-4 text-center">
                  <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                    <span className="text-xs text-slate-500">{item.authorName} • {(item.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700 text-sm">{item.grade.replace("_", " ")}</span>
                    <span className="text-xs text-slate-500">{item.category.replace(/_/g, " ")}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.status === "UPLOAD_PENDING" && (
                      <>
                        <button onClick={() => handleStatusChange(item.id, "APPROVED")} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Onayla">
                          <CheckCircle2 size={18} />
                        </button>
                        <button onClick={() => handleStatusChange(item.id, "REJECTED")} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Reddet">
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {materials.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Aranan kriterlere uygun materyal bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}