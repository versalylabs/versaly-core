import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    version: string;
    [key: string]: unknown;
  };
}

export function apiSuccess<T>(data: T, status: number = 200, meta?: Record<string, unknown>) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      ...meta,
    },
  };
  return NextResponse.json(body, { status });
}

export function apiError(
  message: string,
  code: string = "INTERNAL_ERROR",
  status: number = 500,
  details?: unknown
) {
  const body: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  };
  return NextResponse.json(body, { status });
}
