import { NextRequest, NextResponse } from "next/server";
import { UploadService } from "@/services/upload.service";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { z } from "zod";

const ConfirmSchema = z.object({
    materialId: z.string().uuid()
});

export const POST = withErrorHandler(async (req: NextRequest) => {
    const body = await req.json();
    const { materialId } = ConfirmSchema.parse(body);

    await UploadService.confirmUploadSuccess(materialId);

    return NextResponse.json({ success: true, message: "Upload confirmed and pushed to moderation queue." });
});