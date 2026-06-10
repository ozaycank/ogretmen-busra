"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/shared/hooks/useFavorites";

export default function FavoritesLink() {
  const { favorites, isLoaded } = useFavorites();

  return (
    <Link
      href="/favoriler"
      className="relative inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 hover:shadow-sm transition-all group"
    >
      <Heart 
        size={20} 
        className={`group-hover:scale-110 transition-transform ${favorites.length > 0 ? "fill-rose-500" : ""}`} 
      />
      <span>Favorilerim</span>
      
      {isLoaded && favorites.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white flex items-center justify-center min-w-[24px]">
          {favorites.length}
        </span>
      )}
    </Link>
  );
}