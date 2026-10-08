"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Eye,
  FileArchive,
  FileImage,
  Heart,
  BookOpen,
} from "lucide-react";

import { useFavorites } from "@/shared/hooks/useFavorites";
import { formatSubject } from "@/shared/constants/curriculum";
import { sendGAEvent } from "@next/third-parties/google";

export interface MaterialProps {
  id: string;
  slug: string;
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
    case "pdf":
      return <FileText className="text-red-500" size={24} />;

    case "docx":
    case "doc":
      return <FileText className="text-blue-500" size={24} />;

    case "jpeg":
    case "jpg":
    case "png":
      return <FileImage className="text-emerald-500" size={24} />;

    case "zip":
    case "rar":
      return <FileArchive className="text-amber-500" size={24} />;

    default:
      return <FileText className="text-gray-500" size={24} />;
  }
};

const formatEnum = (text: string) => {
  return text.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};

export default function MaterialCard({
  material,
}: {
  material: MaterialProps;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const isFav = isFavorite(material.id);

  const handleMaterialClick = () => {
    sendGAEvent({
      event: "select_content",
      content_type: "material",
      item_id: material.slug,
    });
  };

  return (
    <div className="group relative block h-full">
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 will-change-transform group-hover:-translate-y-1 hover:shadow-xl">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            toggleFavorite(material.id);
          }}
          className={`absolute top-4 right-4 z-30 rounded-full p-2 shadow-sm backdrop-blur-sm transition-all hover:scale-110 active:scale-95 ${
            isFav
              ? "bg-rose-50 text-rose-500"
              : "bg-white/80 text-slate-400 hover:text-rose-400"
          }`}
          aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
        >
          <Heart size={20} className={isFav ? "fill-rose-500" : ""} />
        </button>

        <Link
          href={`/materyal/${material.slug}`}
          prefetch={false}
          onClick={handleMaterialClick}
          className="absolute inset-0 z-10"
          aria-label={material.title}
        />

        <div className="mb-4 flex flex-wrap gap-2 pr-10">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-[#0284c7]">
            {formatEnum(material.grade)}
          </span>

          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-[#e11d48]">
            {formatEnum(material.category)}
          </span>

          {material.subject !== "TUM_DERSLER" && (
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
              <BookOpen size={12} />

              {formatSubject(material.subject)}
            </span>
          )}
        </div>

        <div className="mb-2 flex items-start gap-3">
          <div className="rounded-xl bg-gray-50 p-2 transition-transform group-hover:scale-110">
            {getFileIcon(material.fileType)}
          </div>

          <h3 className="min-h-[45px] line-clamp-2 text-lg leading-tight font-bold text-gray-800 transition-colors group-hover:text-[#0284c7]">
            {material.title}
          </h3>
        </div>

        <p className="mb-6 min-h-[40px] flex-grow line-clamp-2 text-sm text-gray-500">
          {material.description || "Açıklama bulunmuyor."}
        </p>

        <div className="relative z-20 mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
          <Link
            href={`/yazar/${encodeURIComponent(material.authorName)}`}
            prefetch={false}
            onClick={(event) => event.stopPropagation()}
            className="group/author flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-[#e11d48] to-[#0284c7] text-[10px] font-bold text-white">
              {material.authorName.charAt(0)}
            </div>

            <span className="max-w-[100px] truncate text-xs font-bold text-gray-600 transition-colors group-hover/author:text-[#0284c7] group-hover/author:underline">
              {material.authorName}
            </span>
          </Link>

          <div className="flex select-none gap-3 text-xs font-medium text-gray-400">
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {material.viewCount}
            </span>

            <span className="flex items-center gap-1">
              <Download size={14} />
              {material.downloadCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
