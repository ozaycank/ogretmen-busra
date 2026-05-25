import React from "react";
import Link from "next/link";
import { FileText, Download, Eye, FileArchive, FileImage } from "lucide-react";

// Şema ile uyumlu tip tanımı
interface MaterialProps {
  id: string;
  title: string;
  description: string | null;
  fileType: string;
  authorName: string;
  grade: string;
  category: string;
  viewCount: number;
  downloadCount: number;
}

// Dosya tipine göre dinamik ikon seçimi
const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf": return <FileText className="text-red-500" size={24} />;
    case "docx": case "doc": return <FileText className="text-blue-500" size={24} />;
    case "jpeg": case "jpg": case "png": return <FileImage className="text-emerald-500" size={24} />;
    case "zip": case "rar": return <FileArchive className="text-amber-500" size={24} />;
    default: return <FileText className="text-gray-500" size={24} />;
  }
};

// Enum'ları Türkçe etiketlere çeviren yardımcı fonksiyon
const formatEnum = (text: string) => {
  return text.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export default function MaterialCard({ material }: { material: MaterialProps }) {
  return (
    <Link href={`/materyal/${material.id}`} className="group block h-full">
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col relative overflow-hidden group-hover:-translate-y-1">
        
        {/* Kategori ve Sınıf Etiketleri */}
        <div className="flex gap-2 mb-4">
          <span className="bg-sky-50 text-[#0284c7] px-3 py-1 text-xs font-bold rounded-full">
            {formatEnum(material.grade)}
          </span>
          <span className="bg-rose-50 text-[#e11d48] px-3 py-1 text-xs font-bold rounded-full">
            {formatEnum(material.category)}
          </span>
        </div>

        {/* Başlık ve İkon */}
        <div className="flex items-start gap-3 mb-2">
          <div className="p-2 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
            {getFileIcon(material.fileType)}
          </div>
          <h3 className="text-lg font-bold text-gray-800 leading-tight line-clamp-2 flex-1 group-hover:text-[#0284c7] transition-colors">
            {material.title}
          </h3>
        </div>

        {/* Açıklama */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-grow">
          {material.description || "Açıklama bulunmuyor."}
        </p>

        {/* Yazar ve Metrikler */}
        <div className="border-t border-gray-50 pt-4 flex justify-between items-center mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#0284c7] text-white flex items-center justify-center text-[10px] font-bold">
              {material.authorName.charAt(0)}
            </div>
            <span className="text-xs font-medium text-gray-600 truncate max-w-[100px]">
              {material.authorName}
            </span>
          </div>

          <div className="flex gap-3 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1"><Eye size={14} /> {material.viewCount}</span>
            <span className="flex items-center gap-1"><Download size={14} /> {material.downloadCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}