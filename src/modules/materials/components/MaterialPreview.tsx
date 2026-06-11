"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"; // 🚀 DÜZELTME: next/image eklendi
import { Document, Page, pdfjs } from "react-pdf";
import { FileText, FileArchive, Loader2, AlertCircle, FileImage } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const safeFileUrl = fileUrl.includes("pub-") 
    ? fileUrl.replace(/https:\/\/pub-[a-zA-Z0-9-]+\.r2\.dev/g, "https://r2.ogretmenbusra.com")
    : fileUrl;

  const LoadingFallback = (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm text-slate-400">
      <Loader2 className="animate-spin mb-2 text-sky-500" size={32} />
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Yükleniyor...</span>
    </div>
  );

  const ErrorFallback = ({ icon: Icon, message }: { icon: any, message: string }) => (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-rose-50 text-rose-500 border border-rose-100 rounded-3xl">
      <Icon size={32} className="mb-2" />
      <span className="text-xs font-bold text-center px-4">{message}</span>
    </div>
  );

  // GÖRSEL ÖNİZLEME (IMAGE)
  if (isImage) {
    return (
      <div className="relative w-full aspect-[3/4] md:aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-inner group flex items-center justify-center">
        {loading && !error && LoadingFallback}
        {error ? (
          <ErrorFallback icon={FileImage} message="Görsel önizlemesi yüklenemedi." />
        ) : (
          // 🚀 FIX: native <img> yerine next/image kullanıldı. (CORS ve Proxy koruması için)
          <Image
            src={safeFileUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className={`object-cover transition-opacity duration-500 group-hover:scale-105 ${loading ? "opacity-0" : "opacity-100"}`}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
            unoptimized // R2'den gelen direct linkler için cache sorunu yaşamamak adına (opsiyonel)
          />
        )}
      </div>
    );
  }

  //PDF ÖNİZLEME
  if (isPdf) {
    return (
      <div className="relative w-full aspect-[1/1.4] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex items-start justify-center">
        {loading && !error && LoadingFallback}
        {error ? (
          <ErrorFallback icon={AlertCircle} message="PDF okunamadı veya şifreli." />
        ) : (
          <div className={`w-full flex justify-center transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"}`}>
            <Document
              file={safeFileUrl}
              loading={null} // Kendi loading bileşenimizi kullandığımız için react-pdf'in iç loading'ini kapattık
              onLoadSuccess={() => setLoading(false)}
              onLoadError={(err) => {
                console.error("PDF Load Error:", err);
                setLoading(false);
                setError(true);
              }}
              className="w-full flex justify-center mt-4"
            >
              <Page 
                pageNumber={1} 
                renderTextLayer={false} 
                renderAnnotationLayer={false}
                width={280} // Mobilde taşmaması için sabit genişlik
                className="shadow-md rounded-sm overflow-hidden"
              />
            </Document>
          </div>
        )}
        <div className="absolute bottom-4 right-4 bg-rose-500/90 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-black tracking-widest shadow-sm z-30">
          PDF
        </div>
      </div>
    );
  }

  // DİĞER DOSYALAR (ZIP, DOCX) - Önizleme Yok
  return (
    <div className="relative w-full aspect-[3/4] md:aspect-square bg-slate-50 border border-slate-200 rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-inner">
      {type === "zip" || type === "rar" ? (
        <FileArchive className="text-amber-500 mb-4" size={64} />
      ) : (
        <FileText className="text-sky-500 mb-4" size={64} />
      )}
      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{type} Dosyası</span>
      <span className="text-xs text-slate-500 mt-2 max-w-[80%] leading-relaxed">
        Bu dosya türü için önizleme desteklenmiyor. İndirerek görüntüleyebilirsiniz.
      </span>
    </div>
  );
}