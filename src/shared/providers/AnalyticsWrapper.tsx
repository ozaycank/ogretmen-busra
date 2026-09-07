"use client";

import { useCookieConsent } from "./CookieProvider";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function AnalyticsWrapper() {
  const { preferences, isLoaded } = useCookieConsent();

  // Çerezler henüz yüklenmediyse veya analitik izni reddedildiyse scripti yükleme.
  if (!isLoaded || !preferences.analytics) {
    return null;
  }

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) {
    console.warn("GA4 Measurement ID is missing in environment variables.");
    return null;
  }

  return <GoogleAnalytics gaId={gaId} />;
}