"use client";

import { useState, useEffect } from "react";

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Sayfa yüklendiğinde LocalStorage'dan favorileri al (Hydration error önlemi)
    useEffect(() => {
        const stored = localStorage.getItem("busra_ogretmen_favorites");
        if (stored) {
            try {
                setFavorites(JSON.parse(stored));
            } catch (e) {
                console.error("Favoriler okunamadı", e);
            }
        }
        setIsLoaded(true);
    }, []);

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => {
            const isFavorited = prev.includes(id);
            const newFavorites = isFavorited
                ? prev.filter((favId) => favId !== id) // Çıkar
                : [...prev, id]; // Ekle

            localStorage.setItem("busra_ogretmen_favorites", JSON.stringify(newFavorites));

            // Diğer sekmeleri de haberdar etmek için özel event fırlat (Opsiyonel)
            window.dispatchEvent(new Event("favoritesUpdated"));
            return newFavorites;
        });
    };

    const isFavorite = (id: string) => favorites.includes(id);

    return { favorites, toggleFavorite, isFavorite, isLoaded };
}