import { NextRequest, NextResponse } from "next/server";
import { MaterialService } from "@/services/material.service";
import { createMaterialSchema, getMaterialsQuerySchema } from "@/schemas/material.schema";
import { successResponse } from "@/lib/api/api-response";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { materialService } from "@/core/infrastructure/di/container";

export const runtime = "nodejs";

// GET: Fetch paginated materials
export const GET = withErrorHandler(async (req: NextRequest) => {
    const { searchParams } = req.nextUrl;

    const query = getMaterialsQuerySchema.parse({
        page: searchParams.get("page") || undefined,
        limit: searchParams.get("limit") || undefined,
        grade: searchParams.get("grade") || undefined,
        category: searchParams.get("category") || undefined,
        search: searchParams.get("search") || undefined,
    });

    const result = await MaterialService.getMaterials(query);

    return successResponse(
        result.items,
        "Materials fetched successfully",
        {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        }
    );
});

// POST: Upload a new material
export const POST = withErrorHandler(async (req: NextRequest) => {
    const formData = await req.formData();

    // 1. Zod Validation for primitive text fields
    const rawData = {
        title: formData.get("title"),
        description: formData.get("description") || null,
        authorName: formData.get("authorName"),
        grade: formData.get("grade"),
        category: formData.get("category"),
        turnstileToken: formData.get("turnstileToken"),
    };

    const validatedData = createMaterialSchema.parse(rawData);

    // 2. File Validation
    const file = formData.get("file") as File | null;
    if (!file) throw Object.assign(new Error("File is required"), { statusCode: 400 });

    const ALLOWED_TYPES = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png"
    ];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    if (!ALLOWED_TYPES.includes(file.type)) {
        throw Object.assign(new Error("Unsupported file format"), { statusCode: 400 });
    }

    if (file.size > MAX_SIZE) {
        throw Object.assign(new Error("File exceeds 10MB limit"), { statusCode: 400 });
    }

    // 3. Extract IP for Security
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // 4. Delegate to Service Layer
    const newMaterial = await MaterialService.createMaterial({
        ...validatedData,
        file,
        ip,
    });

    return successResponse(
        { id: newMaterial.id },
        "Material uploaded successfully and is pending approval",
        undefined,
        201
    );
});

