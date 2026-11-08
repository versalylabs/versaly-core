import { loadWorkspaceDataFromDb } from "@/lib/workspace-data-server";
import { buildWeeklyDigest, type WeeklyDigest } from "@/lib/weekly-digest";
import { emailConfigured, sendEmail } from "@/lib/email";
import { isoDay } from "@/lib/money";

export async function previewWeeklyReview(): Promise<WeeklyDigest> {
  const { data, businessName } = await loadWorkspaceDataFromDb();
  return buildWeeklyDigest(data, isoDay(new Date()), { businessName });
}

export type WeeklyReviewResult =
  | { sent: true; to: string; subject: string }
  | { sent: false; reason: string; configured: boolean };

/** Build this week's review from the database and email it to `to`. */
export async function sendWeeklyReview(to: string | undefined): Promise<WeeklyReviewResult> {
  if (!emailConfigured()) {
    return { sent: false, configured: false, reason: "Email sending is not set up yet (RESEND_API_KEY is missing)." };
  }
  if (!to) return { sent: false, configured: true, reason: "No recipient: set WEEKLY_REVIEW_TO." };

  const digest = await previewWeeklyReview();
  const result = await sendEmail({ to, subject: digest.subject, text: digest.text, html: digest.html });
  if (!result.ok) return { sent: false, configured: true, reason: result.error };
  return { sent: true, to, subject: digest.subject };
}
