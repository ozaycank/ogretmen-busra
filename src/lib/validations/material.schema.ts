import { z } from "zod";
import { GradeLevel, ContentCategory } from "@prisma/client";

export const createMaterialSchema = z.object({
    title: z.string().min(5, "Title is too short").max(150, "Title is too long"),
    description: z.string().max(500).optional().nullable(),
    authorName: z.string().min(2, "Author name is required").max(100),

    // Düzeltme: 'required_error' yerine 'message' kullanıldı
    grade: z.nativeEnum(GradeLevel, { message: "Invalid grade level" }),
    category: z.nativeEnum(ContentCategory, { message: "Invalid category" }),

    turnstileToken: z.string().min(1, "Security token is required"),
});

export const getMaterialsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(12),
    grade: z.nativeEnum(GradeLevel).optional(),
    category: z.nativeEnum(ContentCategory).optional(),
    search: z.string().optional(),
});