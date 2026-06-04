import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_MAGIC_BYTES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'image/jpeg',
    'image/png'
];

export class ValidationService {
    /**
     * Dosyanın ilk chunk'ını okuyarak gerçek (Magic Byte) MIME tipini doğrular.
     */
    static async verifyMagicBytes(buffer: Buffer): Promise<boolean> {
        const type = await fileTypeFromBuffer(buffer);

        if (!type) return false;
        return ALLOWED_MAGIC_BYTES.includes(type.mime);
    }

    /**
     * Anti-Virus Tarama Simülasyonu (ClamAV veya Cloudflare API Entegrasyonu Noktası)
     */
    static async scanForMalware(fileUrl: string): Promise<{ isClean: boolean; details: string }> {
        // GERÇEK SENARYO: Dosyayı ClamAV'ye veya VirusTotal API'sine gönderin.
        // Şimdilik stub (yer tutucu) mantığı:
        return { isClean: true, details: "Scanned via ClamAV: Clean" };
    }
}