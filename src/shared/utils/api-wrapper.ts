import { NextRequest } from "next/server";
import { errorResponse } from "./api-response";
import { logger } from "@/infrastructure/logger";
import * as Sentry from "@sentry/nextjs";

export const withErrorHandler = (
    handler: (req: NextRequest) => Promise<any>
) => {
    return async (req: NextRequest) => {
        try {
            return await handler(req);
        } catch (error: any) {
            const requestId = req.headers.get("x-request-id") || "unknown";

            // 1. Yapısal (JSON) Loglama - Axiom/Datadog için
            logger.error({
                err: error,
                method: req.method,
                url: req.nextUrl.pathname,
                requestId
            }, "API Request Failed");

            // 2. Alarm ve Takip - Sentry için
            Sentry.captureException(error, {
                tags: {
                    endpoint: req.nextUrl.pathname,
                    requestId
                }
            });

            // Prisma Unique Constraint Violation
            if (error.code === "P2002") {
                return errorResponse(error, 409, "Conflict: Resource or token already exists.");
            }

            return errorResponse(error);
        }
    };
};