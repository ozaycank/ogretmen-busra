import { NextRequest } from "next/server";
import { errorResponse } from "./api-response";

export const withErrorHandler = (
    handler: (req: NextRequest) => Promise<any>
) => {
    return async (req: NextRequest) => {
        try {
            return await handler(req);
        } catch (error: any) {
            console.error(`[API_ERROR] ${req.method} ${req.nextUrl.pathname}:`, error);

            // Prisma Unique Constraint Violation
            if (error.code === "P2002") {
                return errorResponse(error, 409, "Conflict: Resource or token already exists.");
            }

            return errorResponse(error);
        }
    };
};