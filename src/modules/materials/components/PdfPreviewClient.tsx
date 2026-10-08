"use client";

import { useState } from "react";

import { Document, Page, pdfjs } from "react-pdf";

import { AlertCircle, Loader2 } from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfPreviewClientProps {
  fileUrl: string;
  title: string;
}

export default function PdfPreviewClient({
  fileUrl,
  title,
}: PdfPreviewClientProps) {
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  return (
    <div
      className="relative flex aspect-[1/1.4] w-full items-start justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm"
      aria-label={`${title} PDF önizlemesi`}
    >
      {loading && !error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/80 text-slate-400 backdrop-blur-sm">
          <Loader2 className="mb-2 animate-spin text-sky-500" size={32} />

          <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            PDF yükleniyor...
          </span>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl border border-rose-100 bg-rose-50 text-rose-500">
          <AlertCircle size={32} className="mb-2" />

          <span className="px-4 text-center text-xs font-bold">
            PDF okunamadı veya önizleme oluşturulamadı.
          </span>
        </div>
      ) : (
        <div
          className={`flex w-full justify-center transition-opacity duration-500 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
        >
          <Document
            file={fileUrl}
            loading={null}
            onLoadSuccess={() => {
              setLoading(false);
              setError(false);
            }}
            onLoadError={(loadError) => {
              console.error("[PDF_PREVIEW_LOAD_ERROR]", loadError);

              setLoading(false);
              setError(true);
            }}
            className="mt-4 flex w-full justify-center"
          >
            <Page
              pageNumber={1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={280}
              className="overflow-hidden rounded-sm shadow-md"
            />
          </Document>
        </div>
      )}

      <div className="absolute right-4 bottom-4 z-30 rounded-lg bg-rose-500/90 px-3 py-1 text-[10px] font-black tracking-widest text-white shadow-sm backdrop-blur-md">
        PDF
      </div>
    </div>
  );
}
