import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";
import { emailConfigured } from "@/lib/email";
import { logger } from "@/lib/logger";
import { previewWeeklyReview, sendWeeklyReview } from "@/lib/weekly-review-service";

/**
 *   GET  → preview of this week's review, and whether email is set up
 *   POST → send it now
 * Owners and admins only (it summarises company finances).
 */

async function requireManager() {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return { error: apiError("Database unavailable", "DB_UNAVAILABLE", 503) };
  }
  if (!user) return { error: apiError("Unauthenticated", "UNAUTHORIZED", 401) };
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return { error: apiError("Owners and admins only", "FORBIDDEN", 403) };
  }
  return { user };
}

export async function GET() {
  const auth = await requireManager();
  if (auth.error) return auth.error;

  try {
    const digest = await previewWeeklyReview();
    return apiSuccess({
      configured: emailConfigured(),
      recipient: process.env.WEEKLY_REVIEW_TO || auth.user!.email,
      scheduled: Boolean(process.env.CRON_SECRET && process.env.WEEKLY_REVIEW_TO && emailConfigured()),
      digest: { subject: digest.subject, text: digest.text },
    });
  } catch (error) {
    logger.error("Weekly review preview failed", {}, error);
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
}

export async function POST() {
  const auth = await requireManager();
  if (auth.error) return auth.error;

  try {
    const result = await sendWeeklyReview(process.env.WEEKLY_REVIEW_TO || auth.user!.email);
    return apiSuccess(result);
  } catch (error) {
    logger.error("Weekly review send failed", {}, error);
    return apiError("Could not send the weekly review", "INTERNAL_ERROR", 500);
  }
}
