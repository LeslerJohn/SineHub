import "dotenv/config";

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || "info";

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(
  level: LogLevel,
  context: string,
  message: string
): string {
  const tag = level.toUpperCase().padEnd(5);
  return `[${timestamp()}] [${context}] ${tag}: ${message}`;
}

export function createLogger(context: string) {
  return {
    debug(message: string, ...args: unknown[]) {
      if (shouldLog("debug")) {
        console.debug(formatMessage("debug", context, message), ...args);
      }
    },

    info(message: string, ...args: unknown[]) {
      if (shouldLog("info")) {
        console.info(formatMessage("info", context, message), ...args);
      }
    },

    warn(message: string, ...args: unknown[]) {
      if (shouldLog("warn")) {
        console.warn(formatMessage("warn", context, message), ...args);
      }
    },

    error(message: string, ...args: unknown[]) {
      if (shouldLog("error")) {
        console.error(formatMessage("error", context, message), ...args);
      }
    },
  };
}
