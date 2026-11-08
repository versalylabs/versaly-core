import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { tokensMatch } from "@/lib/callback-secret";
import { logger } from "@/lib/logger";
import { sendWeeklyReview } from "@/lib/weekly-review-service";

/**
 * Friday weekly review, called by Vercel Cron (see vercel.json). Vercel sends
 * "Authorization: Bearer <CRON_SECRET>"; anything else is refused.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16 || !tokensMatch(req.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return apiError("Unauthorized", "UNAUTHORIZED", 401);
  }

  try {
    const result = await sendWeeklyReview(process.env.WEEKLY_REVIEW_TO);
    // "Not set up yet" is not an error worth failing the cron over
    return apiSuccess(result);
  } catch (error) {
    logger.error("Weekly review failed", {}, error);
    return apiError("Weekly review failed", "INTERNAL_ERROR", 500);
  }
}
