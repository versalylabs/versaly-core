import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "connected";
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (error) {
    dbStatus = "disconnected";
    return apiError(
      "Database connection failed",
      "SERVICE_UNAVAILABLE",
      503,
      {
        dbStatus,
        error: error instanceof Error ? error.message : String(error),
        uptime: process.uptime(),
      }
    );
  }

  return apiSuccess({
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    totalResponseTimeMs: Date.now() - startTime,
  });
}
