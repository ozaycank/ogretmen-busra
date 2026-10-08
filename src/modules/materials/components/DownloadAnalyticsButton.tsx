"use client";

import React from "react";
import { Download } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";

interface DownloadBtnProps {
  materialId: string;
  materialSlug: string;
  grade: string;
  subject: string;
}

export default function DownloadAnalyticsButton({
  materialId,
  materialSlug,
  grade,
  subject,
}: DownloadBtnProps) {
  const handleDownload = () => {
    sendGAEvent({
      event: "material_download",
      material_slug: materialSlug,
      grade,
      subject,
    });

    const downloadUrl = `/api/download?id=${encodeURIComponent(materialId)}`;

    const downloadWindow = window.open(downloadUrl, "_blank");

    if (downloadWindow) {
      downloadWindow.opener = null;
    } else {
      // Popup engelleyici yeni sekmeyi engellerse
      // indirme aynı sekmede devam eder.
      window.location.assign(downloadUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-8 py-4 text-lg font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-lg"
    >
      <Download size={24} />
      Dosyayı İndir
    </button>
  );
}
