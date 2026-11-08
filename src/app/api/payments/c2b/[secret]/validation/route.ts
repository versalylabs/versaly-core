import { NextRequest, NextResponse } from "next/server";
import { secretMatches } from "@/lib/callback-secret";

/**
 * Daraja C2B "validation" callback. We accept every payment (a customer who
 * has already typed their PIN should never be bounced) and match them to
 * invoices afterwards; anything unmatched is listed for manual assignment.
 */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ secret: string }> }) {
  const { secret } = await ctx.params;
  if (!secretMatches(secret)) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
