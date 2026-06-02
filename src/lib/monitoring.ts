/**
 * Production-ready hata izleme servisi entegrasyon noktası.
 * Gerçek bir senaryoda buraya @sentry/nextjs entegre edilir.
 */
export const logErrorToMonitoring = (error: Error, digest?: string) => {
    // Geliştirme ortamında konsola bas
    if (process.env.NODE_ENV !== "production") {
        console.error("🚨 [Frontend Error Caught]:", error);
        if (digest) console.error("Hash (Digest):", digest);
        return;
    }

    // Prodüksiyonda Sentry / Datadog / LogRocket gibi servislere gönder
    try {
        // Sentry.captureException(error, { tags: { digest } });

        // Geçici olarak kendi backend API'mize de gönderebiliriz:
        fetch("/api/monitoring/errors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                digest,
                url: window.location.href,
                timestamp: new Date().toISOString()
            }),
            keepalive: true, // Sayfa kapansa bile isteğin gitmesini sağlar
        }).catch(() => { /* İzleme servisi çökerse sessizce başarısız ol */ });

    } catch (e) {
        // İzleme entegrasyonu hatası ana uygulamayı çökertmemeli
        console.error("İzleme servisi hatası:", e);
    }
};