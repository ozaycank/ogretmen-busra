"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  FileText,
  FileArchive,
  Loader2,
  FileImage,
  type LucideIcon,
} from "lucide-react";

const PdfPreviewClient = dynamic(() => import("./PdfPreviewClient"), {
  ssr: false,
  loading: () => (
    <div className="relative flex aspect-[1/1.4] w-full items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
      <div className="flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="mb-2 animate-spin text-sky-500" size={32} />

        <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
          PDF yükleniyor...
        </span>
      </div>
    </div>
  ),
});

interface MaterialPreviewProps {
  fileUrl: string;
  fileType: string;
  title: string;
}

interface ErrorFallbackProps {
  icon: LucideIcon;
  message: string;
}

function ErrorFallback({ icon: Icon, message }: ErrorFallbackProps) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl border border-rose-100 bg-rose-50 text-rose-500">
      <Icon size={32} className="mb-2" />

      <span className="px-4 text-center text-xs font-bold">{message}</span>
    </div>
  );
}

export default function MaterialPreview({
  fileUrl,
  fileType,
  title,
}: MaterialPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const type = fileType.toLowerCase();

  const isImage = ["jpg", "jpeg", "png", "webp"].includes(type);

  const isPdf = type === "pdf";

  const safeFileUrl = fileUrl.includes("pub-")
    ? fileUrl.replace(
        /https:\/\/pub-[a-zA-Z0-9-]+\.r2\.dev/g,
        "https://r2.ogretmenbusra.com",
      )
    : fileUrl;

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [safeFileUrl, type]);

  const loadingFallback = (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/80 text-slate-400 backdrop-blur-sm">
      <Loader2 className="mb-2 animate-spin text-sky-500" size={32} />

      <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
        Yükleniyor...
      </span>
    </div>
  );

  // --------------------------------------------------
  // GÖRSEL ÖNİZLEME
  // --------------------------------------------------

  if (isImage) {
    return (
      <div className="group relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner md:aspect-square">
        {loading && !error && loadingFallback}

        {error ? (
          <ErrorFallback
            icon={FileImage}
            message="Görsel önizlemesi yüklenemedi."
          />
        ) : (
          <Image
            src={safeFileUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className={`object-cover transition-all duration-500 group-hover:scale-105 ${
              loading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => {
              setLoading(false);
            }}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            unoptimized
          />
        )}
      </div>
    );
  }

  // --------------------------------------------------
  // PDF ÖNİZLEME
  // --------------------------------------------------

  if (isPdf) {
    return <PdfPreviewClient fileUrl={safeFileUrl} title={title} />;
  }

  // --------------------------------------------------
  // DİĞER DOSYALAR
  // --------------------------------------------------

  return (
    <div className="relative flex aspect-[3/4] w-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center shadow-inner md:aspect-square">
      {type === "zip" || type === "rar" ? (
        <FileArchive className="mb-4 text-amber-500" size={64} />
      ) : (
        <FileText className="mb-4 text-sky-500" size={64} />
      )}

      <span className="text-sm font-bold tracking-widest text-slate-400 uppercase">
        {type} Dosyası
      </span>

      <span className="mt-2 max-w-[80%] text-xs leading-relaxed text-slate-500">
        Bu dosya türü için önizleme desteklenmiyor. İndirerek
        görüntüleyebilirsiniz.
      </span>
    </div>
  );
}
