import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { secretMatches } from "@/lib/callback-secret";

/**
 * Safaricom Daraja C2B "confirmation" callback: called once for every Paybill or
 * Till payment. Public (Safaricom can't sign in), so the URL contains a secret
 * token (MPESA_CALLBACK_SECRET). Register it in the Daraja portal as:
 *   https://<your-domain>/api/payments/c2b/<secret>/confirmation
 * (Daraja rejects URLs containing words like "mpesa", hence "payments".)
 */

const ACCEPTED = { ResultCode: 0, ResultDesc: "Accepted" };

const payloadSchema = z.object({
  TransID: z.string().min(3).max(64),
  TransAmount: z.union([z.string(), z.number()]),
  TransTime: z.string().max(32).optional(),
  BillRefNumber: z.string().max(100).optional(),
  MSISDN: z.string().max(100).optional(),
  FirstName: z.string().max(100).optional(),
  MiddleName: z.string().max(100).optional(),
  LastName: z.string().max(100).optional(),
  BusinessShortCode: z.union([z.string(), z.number()]).optional(),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ secret: string }> }) {
  const { secret } = await ctx.params;
  if (!secretMatches(secret)) {
    // Same answer as an unknown route, so the URL can't be probed
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn("Ignored malformed M-Pesa confirmation", { issues: parsed.error.issues.length });
    // Still acknowledge, so Safaricom doesn't keep retrying garbage
    return NextResponse.json(ACCEPTED);
  }

  const p = parsed.data;
  const amount = Number(p.TransAmount);
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json(ACCEPTED);

  const payerName = [p.FirstName, p.MiddleName, p.LastName].filter(Boolean).join(" ") || null;

  try {
    await db.incomingPayment.upsert({
      where: { transId: p.TransID },
      update: {}, // a repeated callback never changes a stored payment
      create: {
        transId: p.TransID,
        transTime: p.TransTime ?? null,
        amount,
        billRef: p.BillRefNumber?.trim() || null,
        msisdn: p.MSISDN ?? null,
        payerName,
        businessShortCode: p.BusinessShortCode !== undefined ? String(p.BusinessShortCode) : null,
        raw: body as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logger.error("Failed to store M-Pesa confirmation", { transId: p.TransID }, error);
    // A non-zero result makes Safaricom retry later, which is what we want if the database is down
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Temporary error" }, { status: 503 });
  }

  return NextResponse.json(ACCEPTED);
}
