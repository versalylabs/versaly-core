import { NextRequest } from "next/server";
import { getCurrentUser, clearSessionCookie } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { apiSuccess } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  if (user) {
    await logAuditEvent({
      userId: user.id,
      action: "USER_LOGGED_OUT",
      entityType: "User",
      entityId: user.id,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    });
  }

  await clearSessionCookie();

  return apiSuccess({ message: "Successfully logged out" });
}
