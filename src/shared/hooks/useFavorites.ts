"use client";

import { useState, useEffect } from "react";

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // İlk yüklemede veriyi al
        const loadFavorites = () => {
            const stored = localStorage.getItem("busra_ogretmen_favorites");
            if (stored) {
                try {
                    setFavorites(JSON.parse(stored));
                } catch (e) {
                    console.error("Favoriler okunamadı", e);
                }
            }
        };

        loadFavorites();
        setIsLoaded(true);

        const handleFavoritesUpdated = () => loadFavorites();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "busra_ogretmen_favorites") loadFavorites();
        };

        window.addEventListener("favoritesUpdated", handleFavoritesUpdated);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("favoritesUpdated", handleFavoritesUpdated);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => {
            const isFavorited = prev.includes(id);
            const newFavorites = isFavorited
                ? prev.filter((favId) => favId !== id) // Çıkar
                : [...prev, id]; // Ekle

            localStorage.setItem("busra_ogretmen_favorites", JSON.stringify(newFavorites));

            // Diğer bileşenleri (Navbar, vs.) haberdar et
            window.dispatchEvent(new Event("favoritesUpdated"));
            return newFavorites;
        });
    };

    const isFavorite = (id: string) => favorites.includes(id);

    return { favorites, toggleFavorite, isFavorite, isLoaded };
}