import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    details?: any;
    meta?: any;
}

export const successResponse = <T>(
    data: T,
    message?: string,
    meta?: any,
    status = 200
) => {
    return NextResponse.json(
        { success: true, message, data, meta },
        { status }
    );
};

export const errorResponse = (
    error: unknown,
    status = 500,
    message = "Internal Server Error"
) => {
    if (error instanceof ZodError) {
        return NextResponse.json(
            { success: false, error: "Validation Error", details: error.format() },
            { status: 400 }
        );
    }

    if (error instanceof Error) {
        const customStatus = (error as any).statusCode || status;
        return NextResponse.json(
            { success: false, error: error.message },
            { status: customStatus }
        );
    }

    return NextResponse.json(
        { success: false, error: message },
        { status }
    );
};