import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

export interface LogAuditParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Persists an audit log entry in the database.
 * Fails safely to prevent business transactions from aborting if logging fails.
 */
export async function logAuditEvent(params: LogAuditParams) {
  try {
    const entry = await db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata ?? Prisma.JsonNull,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
    return entry;
  } catch (error) {
    logger.error("Failed to persist audit log event", { params }, error);
    return null;
  }
}
