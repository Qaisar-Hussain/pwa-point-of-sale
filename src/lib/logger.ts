/**
 * Logging utility for consistent logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    const levelStr = level.toUpperCase().padEnd(6);
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    const errorStr = error ? ` | ${error}` : '';
    return `[${timestamp}] [${levelStr}] ${message}${contextStr}${errorStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error instanceof Error ? error.message : String(error),
    };

    const formatted = this.formatLog(entry);

    // Always log in development
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(formatted);
          break;
        case 'info':
          console.info(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'error':
          console.error(formatted, error || '');
          break;
      }
    }

    // In production, only log warn and error
    if (this.isProduction && (level === 'warn' || level === 'error')) {
      console.error(formatted, error || '');
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: any, context?: Record<string, any>) {
    this.log('error', message, context, error);
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, context?: Record<string, any>) {
    this.info(`${method} ${path}`, context);
  }

  /**
   * Log API response
   */
  logResponse(method: string, path: string, statusCode: number, duration?: number) {
    this.info(`${method} ${path} ${statusCode}`, { duration: `${duration}ms` });
  }

  /**
   * Log database operation
   */
  logQuery(operation: string, table: string, duration?: number) {
    if (this.isDevelopment) {
      this.debug(`DB ${operation} on ${table}`, { duration: `${duration}ms` });
    }
  }
}

export const logger = new Logger();
