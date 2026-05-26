import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ValidationService } from "@/services/validation.service";
import { UploadService } from "@/services/upload.service";
import { AuthService } from "@/services/auth.service";

// QStash Webhook Doğrulaması (Sadece Upstash bu rotayı tetikleyebilir)
// import { verifySignature } from "@upstash/qstash/nextjs"; 

export async function POST(req: NextRequest) {
    const { materialId, fileKey, publicUrl } = await req.json();

    try {
        // 1. R2'den dosyanın sadece ilk 4KB'lık (Magic Bytes için) kısmını stream et
        const fileStreamResponse = await fetch(publicUrl, { headers: { Range: "bytes=0-4095" } });
        const buffer = Buffer.from(await fileStreamResponse.arrayBuffer());

        // 2. Magic Byte Analizi
        const isValidFormat = await ValidationService.verifyMagicBytes(buffer);
        if (!isValidFormat) {
            throw new Error("MIME_SPOOF_DETECTED");
        }

        // 3. Malware Taraması (Tam dosya üzerinden)
        const scan = await ValidationService.scanForMalware(publicUrl);
        if (!scan.isClean) {
            throw new Error("MALWARE_DETECTED");
        }

        // 4. Her şey yolundaysa onaylı listeye al
        await prisma.material.update({
            where: { id: materialId },
            data: { status: "APPROVED", scanResult: scan.details, fileUrl: publicUrl }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error(`[WORKER_ERROR] Material: ${materialId}`, error);

        // 5. ROLLBACK STRATEJİSİ: Zararlı veya hatalı dosyayı R2'den imha et
        await UploadService.rollbackFile(fileKey);

        // DB'de reddedildi olarak işaretle
        await prisma.material.update({
            where: { id: materialId },
            data: { status: "REJECTED", scanResult: error.message }
        });

        // Audit Log yaz
        await AuthService.logAudit("MATERIAL_DELETED", "internal_worker", `Reason: ${error.message}`);

        // Queue'ya işlemin bittiğini (tekrar denemesine gerek olmadığını) bildir 200 dön
        return NextResponse.json({ success: false, reason: error.message }, { status: 200 });
    }
}