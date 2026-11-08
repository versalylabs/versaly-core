/**
 * Sends email through Resend (https://resend.com), if it is configured.
 *
 *   RESEND_API_KEY   your Resend API key (without it, nothing is sent)
 *   EMAIL_FROM       e.g. "Versaly Core <reports@yourdomain.com>"; before you
 *                    verify a domain, Resend's test sender only delivers to
 *                    your own account email
 */

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export type SendResult = { ok: true; id?: string } | { ok: false; error: string; notConfigured?: boolean };

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(email: OutgoingEmail): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "Email sending is not set up (RESEND_API_KEY is missing).", notConfigured: true };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Versaly Core <onboarding@resend.dev>",
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) return { ok: false, error: body.message || `The email service refused the message (HTTP ${res.status}).` };
    return { ok: true, id: body.id };
  } catch {
    return { ok: false, error: "Could not reach the email service." };
  }
}
