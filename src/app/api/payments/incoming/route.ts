import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/**
 * Incoming M-Pesa payments for the signed-in app.
 *   GET  → payments waiting to be matched to an invoice
 *   POST → mark one as applied to an invoice, or ignored
 */

export async function GET() {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
  if (!user) return apiError("Unauthenticated", "UNAUTHORIZED", 401);

  try {
    const rows = await db.incomingPayment.findMany({
      where: { status: "UNAPPLIED" },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    return apiSuccess({
      payments: rows.map((r) => ({
        transId: r.transId,
        transTime: r.transTime,
        amount: r.amount,
        billRef: r.billRef,
        msisdn: r.msisdn,
        payerName: r.payerName,
        receivedAt: r.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    logger.error("Reading incoming payments failed", {}, error);
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
}

const markSchema = z.object({
  transId: z.string().min(3).max(64),
  status: z.enum(["APPLIED", "IGNORED"]),
  invoiceId: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
  if (!user) return apiError("Unauthenticated", "UNAUTHORIZED", 401);
  if (user.role === "READ_ONLY") return apiError("Read-only accounts cannot change data", "FORBIDDEN", 403);

  const parsed = markSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("Validation failed", "INVALID_INPUT", 400);

  try {
    const result = await db.incomingPayment.updateMany({
      where: { transId: parsed.data.transId, status: "UNAPPLIED" },
      data: {
        status: parsed.data.status,
        appliedInvoiceId: parsed.data.status === "APPLIED" ? parsed.data.invoiceId ?? null : null,
        appliedAt: new Date(),
      },
    });
    return apiSuccess({ updated: result.count });
  } catch (error) {
    logger.error("Marking incoming payment failed", {}, error);
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
}
