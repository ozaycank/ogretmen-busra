"use client";

import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FileText, FileArchive, Loader2, AlertCircle } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const setupPdfWorker = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
};

interface MaterialPreviewProps {
  fileUrl: string;
  fileType: string;
  title: string;
}

export default function MaterialPreview({ fileUrl, fileType, title }: MaterialPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const type = fileType.toLowerCase();

  const isImage = ["jpg", "jpeg", "png", "webp"].includes(type);
  const isPdf = type === "pdf";

  //Yasaklı r2.dev domainini güvenli custom domain'e otomatik çevirir
  const safeFileUrl = fileUrl.replace(
    /https:\/\/pub-[a-zA-Z0-9]+\.r2\.dev/g, 
    "https://r2.ogretmenbusra.com"
  );

  useEffect(() => {
    setupPdfWorker();
  }, []);
    
  const LoadingFallback = (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
      <Loader2 className="animate-spin mb-2" size={32} />
      <span className="text-xs font-bold uppercase tracking-widest">Yükleniyor...</span>
    </div>
  );

  if (isImage) {
    return (
      <div className="relative w-full aspect-[3/4] md:aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-inner group">
        {loading && LoadingFallback}
        <img
          src={safeFileUrl}
          alt={title}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${loading ? "opacity-0" : "opacity-100"}`}
        />
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-50 text-rose-400">
            <AlertCircle size={32} className="mb-2" />
            <span className="text-xs font-bold text-center px-4">Görsel yüklenemedi</span>
          </div>
        )}
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="relative w-full aspect-[1/1.4] bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md flex items-start justify-center">
        {loading && LoadingFallback}
        <Document
          file={safeFileUrl} // 🚀 DÜZELTİLDİ
          loading={null}
          onLoadSuccess={() => setLoading(false)}
          onLoadError={() => { setLoading(false); setError(true); }}
          className="w-full flex justify-center"
        >
          <Page 
            pageNumber={1} 
            renderTextLayer={false} 
            renderAnnotationLayer={false}
            width={300}
            className="shadow-sm"
          />
        </Document>
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-50 text-rose-400">
            <FileText size={32} className="mb-2" />
            <span className="text-xs font-bold text-center px-4">Önizleme oluşturulamadı</span>
          </div>
        )}
        <div className="absolute bottom-4 right-4 bg-rose-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wider shadow-sm z-10">
          PDF
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square bg-slate-50 border border-slate-200 rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-inner">
      {type === "zip" || type === "rar" ? (
        <FileArchive className="text-amber-500 mb-4" size={64} />
      ) : (
        <FileText className="text-sky-500 mb-4" size={64} />
      )}
      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{type} Dosyası</span>
      <span className="text-xs text-slate-500 mt-2 max-w-[80%]">Bu dosya türü için önizleme desteklenmiyor. İndirerek görüntüleyebilirsiniz.</span>
    </div>
  );
}