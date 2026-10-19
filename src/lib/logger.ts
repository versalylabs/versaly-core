type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

function formatLog(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  err?: unknown
): string {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  if (err instanceof Error) {
    payload.error = {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    };
  } else if (err) {
    payload.error = {
      name: "UnknownError",
      message: String(err),
    };
  }

  return JSON.stringify(payload);
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatLog("debug", message, context));
    }
  },
  info(message: string, context?: Record<string, unknown>) {
    console.info(formatLog("info", message, context));
  },
  warn(message: string, context?: Record<string, unknown>, error?: unknown) {
    console.warn(formatLog("warn", message, context, error));
  },
  error(message: string, context?: Record<string, unknown>, error?: unknown) {
    console.error(formatLog("error", message, context, error));
  },
};
