import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { errorResponse } from "./api-response";
import { ZodSchema } from "zod";

/**
 * Yönetici (Admin) yetkisi gerektiren API rotaları için koruma sarmalayıcısı
 */
export const withAdminAuth = (handler: (req: NextRequest, session: any) => Promise<any>) => {
    return async (req: NextRequest) => {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return errorResponse(null, 403, "Forbidden: Yönetici yetkisi gerekiyor.");
        }

        return handler(req, session);
    };
};

/**
 * Zod ile Gelen Body veya Query parametrelerini doğrulayan Middleware deseni
 */
export const validateRequest = async <T>(
    req: NextRequest,
    schema: ZodSchema<T>,
    type: "body" | "query" = "body"
): Promise<T> => {
    let data;

    if (type === "body") {
        // Content-type kontrolü (Form-data vs JSON)
        const contentType = req.headers.get("content-type") || "";
        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            data = Object.fromEntries(formData.entries());
        } else {
            data = await req.json();
        }
    } else {
        data = Object.fromEntries(req.nextUrl.searchParams.entries());
    }

    // Zod validasyonu (Hata durumunda withErrorHandler bunu yakalayıp 400 dönecektir)
    return schema.parse(data);
};