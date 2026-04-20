import { logger as fbLogger } from 'firebase-functions/v2'

const isProd = process.env.NODE_ENV === 'production'

export const logger = {
  info:  (...args: unknown[]) => fbLogger.info(...args),
  warn:  (...args: unknown[]) => fbLogger.warn(...args),
  error: (...args: unknown[]) => fbLogger.error(...args),
  debug: isProd ? () => undefined : (...args: unknown[]) => fbLogger.debug(...args),
}
