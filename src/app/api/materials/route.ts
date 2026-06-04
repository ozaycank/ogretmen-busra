import { NextRequest } from "next/server";
import { MaterialService } from "@/modules/materials/services/material.service";
import { getMaterialsQuerySchema } from "@/modules/materials/schemas/material.schema";
import { successResponse } from "@/shared/utils/api-response";
import { withErrorHandler } from "@/shared/utils/api-wrapper";

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