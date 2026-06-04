"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Gelecekte eklenebilecek kategoriler için genişletilebilir tip
export type CookiePreferences = {
  necessary: boolean; // Her zaman true olmak zorundadır
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

type CookieContextType = {
  preferences: CookiePreferences;
  isLoaded: boolean;
  updatePreferences: (newPrefs: Partial<CookiePreferences>) => void;
  acceptAll: () => void;
  rejectAllOptional: () => void;
};

const defaultPreferences: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const COOKIE_STORAGE_KEY = "busra_ogretmen_cookie_consent";

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // İlk yüklemede (Hydration sonrası) yerel depolamadaki ayarları al
  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed, necessary: true });
      } catch (e) {
        console.error("Çerez tercihleri okunamadı.", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveToStorage = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(prefs));
    // Gelecekte: İzin loglarını sunucuya göndermek için (Consent Logging API) buraya bir fetch() eklenebilir.
  };

  const updatePreferences = (newPrefs: Partial<CookiePreferences>) => {
    const updated = { ...preferences, ...newPrefs, necessary: true };
    setPreferences(updated);
    saveToStorage(updated);
  };

  const acceptAll = () => {
    const allAccepted = { necessary: true, functional: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    saveToStorage(allAccepted);
  };

  const rejectAllOptional = () => {
    setPreferences(defaultPreferences);
    saveToStorage(defaultPreferences);
  };

  return (
    <CookieContext.Provider value={{ preferences, isLoaded, updatePreferences, acceptAll, rejectAllOptional }}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieProvider");
  }
  return context;
}