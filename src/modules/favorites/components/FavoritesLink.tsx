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
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 hover:shadow-sm transition-all group"
    >
      <Heart 
        size={20} 
        className={`group-hover:scale-110 transition-transform ${favorites.length > 0 ? "fill-rose-500" : ""}`} 
      />
      <span>Favorilerim</span>
      
      {/* Eğer favori varsa sayısını kırmızı bir badge ile göster */}
      {isLoaded && favorites.length > 0 && (
        <span className="bg-rose-500 text-white text-xs px-2.5 py-0.5 rounded-full ml-1 shadow-sm">
          {favorites.length}
        </span>
      )}
    </Link>
  );
}