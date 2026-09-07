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

export default function DownloadAnalyticsButton({ materialId, materialSlug, grade, subject }: DownloadBtnProps) {
  const handleDownload = () => {
    // Custom GA4 İndirme Olayı
    sendGAEvent({
      event: "material_download",
      material_slug: materialSlug,
      grade: grade,
      subject: subject
    });
  };

  return (
    <a 
      href={`/api/download?id=${materialId}`}
      onClick={handleDownload}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 flex justify-center items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
    >
      <Download size={24} /> Dosyayı İndir
    </a>
  );
}