"use client";

import { useEffect } from "react";

interface MaterialViewTrackerProps {
  materialId: string;
}

export default function MaterialViewTracker({
  materialId,
}: MaterialViewTrackerProps) {
  useEffect(() => {
    const controller = new AbortController();

    async function trackView() {
      try {
        await fetch(`/api/materials/${encodeURIComponent(materialId)}/view`, {
          method: "POST",

          signal: controller.signal,

          keepalive: true,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        /*
         * Analytics başarısız olduğunda kullanıcı
         * deneyimini bozmayalım.
         */
        console.error("[MATERIAL_VIEW_TRACK_ERROR]", error);
      }
    }

    void trackView();

    return () => {
      controller.abort();
    };
  }, [materialId]);

  return null;
}
