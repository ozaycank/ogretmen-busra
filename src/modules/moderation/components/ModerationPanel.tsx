"use client";

import React, { useState, useTransition } from "react";
import { moderateMaterial } from "@/app/admin/(protected)/materials/pending/[id]/actions";
import { CheckCircle2, XCircle, AlertTriangle, FileText, Download, Loader2 } from "lucide-react";

interface ModerationPanelProps {
  materialId: string;
  fileUrl: string;
  fileType: string;
}

export default function ModerationPanel({ materialId, fileUrl, fileType }: ModerationPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [modalType, setModalType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [reason, setReason] = useState("");

  const safeFileUrl = fileUrl.replace(
    /https:\/\/pub-[a-zA-Z0-9]+\.r2\.dev/g, 
    "https://r2.ogretmenbusra.com"
  );

  const handleAction = () => {
    if (!modalType) return;
    startTransition(async () => {
      await moderateMaterial(materialId, modalType, reason);
    });
  };

  return (
    <div className="space-y-6">
      {/* Aksiyon Butonları */}
      <div className="flex gap-4">
        <button 
          onClick={() => setModalType("APPROVE")}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
        >
          <CheckCircle2 size={20} /> Onayla ve Yayınla
        </button>
        <button 
          onClick={() => setModalType("REJECT")}
          className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
        >
          <XCircle size={20} /> Reddet ve Sil
        </button>
      </div>

      {/* Önizleme Alanı */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 h-[600px] relative flex flex-col">
        <div className="bg-slate-800 p-3 flex justify-between items-center text-slate-300">
          <span className="text-sm font-bold flex items-center gap-2"><FileText size={16}/> Güvenli Önizleme</span>
          <a href={safeFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-bold">
            <Download size={16} /> Orijinali İndir
          </a>
        </div>
        <div className="flex-1 bg-white">
          {fileType === "pdf" ? (
            <iframe 
              src={`${safeFileUrl}#toolbar=0`} 
              className="w-full h-full border-none" 
              title="PDF Preview"
              sandbox="allow-same-origin allow-scripts" 
            />
          ) : ["png", "jpg", "jpeg"].includes(fileType) ? (
            <img src={safeFileUrl} alt="Preview" className="w-full h-full object-contain bg-slate-100" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-500">
              <AlertTriangle size={48} className="mb-4 text-amber-500" />
              <p className="font-bold">Bu dosya türü (.{fileType}) için tarayıcı önizlemesi desteklenmiyor.</p>
              <p className="text-sm mt-2">İncelemek için dosyayı indirmelisiniz.</p>
            </div>
          )}
        </div>
      </div>

      {/* Onay/Red Modalı */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className={`text-xl font-black mb-2 ${modalType === "APPROVE" ? "text-emerald-600" : "text-rose-600"}`}>
              {modalType === "APPROVE" ? "Materyali Onaylıyorsunuz" : "Materyali Reddediyorsunuz"}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {modalType === "APPROVE" 
                ? "Bu işlem materyali herkese açık hale getirecektir." 
                : "Bu materyal kalıcı olarak reddedilecek ve sistemden gizlenecektir."}
            </p>
            
            <label className="block text-sm font-bold text-slate-900 mb-2">Moderasyon Notu (Opsiyonel)</label>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none mb-6 resize-none"
              rows={3}
              placeholder={modalType === "REJECT" ? "Örn: Telif hakkı ihlali, hatalı içerik..." : "Örn: Temiz ve faydalı içerik."}
            />

            <div className="flex gap-3 justify-end">
              <button onClick={() => setModalType(null)} disabled={isPending} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">İptal</button>
              <button 
                onClick={handleAction} 
                disabled={isPending}
                className={`flex items-center gap-2 px-5 py-2.5 font-bold text-white rounded-xl transition-colors disabled:opacity-50 ${modalType === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
              >
                {isPending ? <Loader2 className="animate-spin" size={18} /> : modalType === "APPROVE" ? "Onayla" : "Reddet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}