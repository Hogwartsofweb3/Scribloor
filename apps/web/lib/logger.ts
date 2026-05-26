export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  duration?: number;
  [key: string]: any;
}

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Strips sensitive data like private keys and JWTs from context
 */
function sanitizeContext(context: LogContext): LogContext {
  const sanitized = { ...context };
  
  // Never log these fields
  const sensitiveKeys = ['privateKey', 'jwt', 'token', 'secret', 'password', 'cookie'];
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeContext(sanitized[key]); // Recursive sanitization
    }
  }
  
  return sanitized;
}

function formatConsoleLog(level: LogLevel, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  
  // Basic ANSI colors for dev
  const colors = {
    debug: '\x1b[34m', // Blue
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m'
  };

  const contextStr = context && Object.keys(context).length > 0 
    ? `\n  ${JSON.stringify(sanitizeContext(context), null, 2)}` 
    : '';

  console.log(`${colors[level]}[${timestamp}] [${level.toUpperCase()}]${colors.reset} ${message}${contextStr}`);
}

function formatJsonLog(level: LogLevel, message: string, context?: LogContext) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizeContext(context || {})
  };
  
  console.log(JSON.stringify(logEntry));
}

function log(level: LogLevel, message: string, context?: LogContext) {
  if (isDev) {
    formatConsoleLog(level, message, context);
  } else {
    formatJsonLog(level, message, context);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};
