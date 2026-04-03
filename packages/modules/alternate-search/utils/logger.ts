import type { SearchLogger } from '../core/types'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogHandler = (level: LogLevel, message: string, meta?: Record<string, unknown>) => void

export type LoggerOptions = {
  level?: LogLevel
  handler?: LogHandler
}

export type Logger = SearchLogger

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const minLevel = options.level ?? 'info'

  const fallbackHandler: LogHandler = (level, message, meta) => {
    const payload = meta ?? {}
    if (level === 'debug') console.debug(message, payload)
    else if (level === 'info') console.info(message, payload)
    else if (level === 'warn') console.warn(message, payload)
    else console.error(message, payload)
  }

  const handler = options.handler ?? fallbackHandler

  const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel])
      return
    handler(level, message, meta)
  }

  return {
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, cause) => {
      const meta = cause instanceof Error
        ? { name: cause.name, message: cause.message, stack: cause.stack }
        : { cause }
      log('error', message, meta)
    },
  }
}
