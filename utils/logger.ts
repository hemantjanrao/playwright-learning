type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function getMinLevel(): LogLevel {
  const fromEnv = process.env.LOG_LEVEL?.toLowerCase();
  if (fromEnv === 'debug' || fromEnv === 'info' || fromEnv === 'warn' || fromEnv === 'error') {
    return fromEnv;
  }
  return process.env.CI ? 'warn' : 'info';
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[getMinLevel()];
}

function formatMessage(level: LogLevel, message: string, context?: unknown): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (context === undefined) {
    return `${prefix} ${message}`;
  }
  return `${prefix} ${message} ${JSON.stringify(context)}`;
}

export const logger = {
  debug(message: string, context?: unknown): void {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, context));
    }
  },
  info(message: string, context?: unknown): void {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message, context));
    }
  },
  warn(message: string, context?: unknown): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, context));
    }
  },
  error(message: string, context?: unknown): void {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, context));
    }
  },
};
