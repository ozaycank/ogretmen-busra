"use client";

import React from "react";
import Link from "next/link";
import { FileText, Download, Eye, FileArchive, FileImage, Heart, BookOpen } from "lucide-react";
import { useFavorites } from "@/shared/hooks/useFavorites";
import { formatSubject } from "@/shared/constants/curriculum";

interface MaterialProps {
  id: string;
  title: string;
  description: string | null;
  fileType: string;
  authorName: string;
  grade: string;
  subject: string; 
  category: string;
  viewCount: number;
  downloadCount: number;
}

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf": return <FileText className="text-red-500" size={24} />;
    case "docx": case "doc": return <FileText className="text-blue-500" size={24} />;
    case "jpeg": case "jpg": case "png": return <FileImage className="text-emerald-500" size={24} />;
    case "zip": case "rar": return <FileArchive className="text-amber-500" size={24} />;
    default: return <FileText className="text-gray-500" size={24} />;
  }
};

const formatEnum = (text: string) => {
  return text.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export default function MaterialCard({ material }: { material: MaterialProps }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(material.id);
  
  return (
    <div className="group block h-full relative">
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-xl transition duration-300 h-full flex flex-col relative overflow-hidden group-hover:-translate-y-1 will-change-transform">
        
        <button 
          onClick={(e) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            toggleFavorite(material.id);
          }}
          className={`absolute top-4 right-4 z-30 p-2 rounded-full backdrop-blur-sm shadow-sm transition-all hover:scale-110 active:scale-95 ${isFav ? "bg-rose-50 text-rose-500" : "bg-white/80 text-slate-400 hover:text-rose-400"}`}
          aria-label="Favorilere Ekle"
        >
          <Heart size={20} className={isFav ? "fill-rose-500" : ""} />
        </button>

        <Link href={`/materyal/${material.id}`} className="absolute inset-0 z-10" aria-label={material.title} />
        
        <div className="flex flex-wrap gap-2 mb-4 pr-10">
          <span className="bg-sky-50 text-[#0284c7] px-3 py-1 text-xs font-bold rounded-full">
            {formatEnum(material.grade)}
          </span>
          <span className="bg-rose-50 text-[#e11d48] px-3 py-1 text-xs font-bold rounded-full">
            {formatEnum(material.category)}
          </span>
          {material.subject !== "TUM_DERSLER" && (
            <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 text-xs font-bold rounded-full">
              <BookOpen size={12} /> {formatSubject(material.subject)}
            </span>
          )}
        </div>

        <div className="flex items-start gap-3 mb-2">
          <div className="p-2 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
            {getFileIcon(material.fileType)}
          </div>
          <h3 className="text-lg font-bold text-gray-800 leading-tight line-clamp-2 min-h-[45px] group-hover:text-[#0284c7] transition-colors">
            {material.title}
          </h3>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-6 min-h-[40px] flex-grow">
          {material.description || "Açıklama bulunmuyor."}
        </p>

        <div className="border-t border-gray-50 pt-4 flex justify-between items-center mt-auto relative z-20">
          <Link 
            href={`/yazar/${encodeURIComponent(material.authorName)}`}
            className="flex items-center gap-2 group/author hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#0284c7] text-white flex items-center justify-center text-[10px] font-bold">
              {material.authorName.charAt(0)}
            </div>
            <span className="text-xs font-bold text-gray-600 group-hover/author:text-[#0284c7] group-hover/author:underline truncate max-w-[100px] transition-colors">
              {material.authorName}
            </span>
          </Link>

          <div className="flex gap-3 text-xs text-gray-400 font-medium select-none">
            <span className="flex items-center gap-1"><Eye size={14} /> {material.viewCount}</span>
            <span className="flex items-center gap-1"><Download size={14} /> {material.downloadCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}