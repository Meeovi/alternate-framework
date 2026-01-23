export type AlternateLogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface AlternateLogger {
  level: AlternateLogLevel
  debug(message: string, meta?: unknown): void
  info(message: string, meta?: unknown): void
  warn(message: string, meta?: unknown): void
  error(message: string, meta?: unknown): void
}

export function createLogger(level: AlternateLogLevel = 'info'): AlternateLogger {
  const levels: AlternateLogLevel[] = ['debug', 'info', 'warn', 'error']

  function shouldLog(target: AlternateLogLevel) {
    return levels.indexOf(target) >= levels.indexOf(level)
  }

  return {
    level,
    debug(message, meta) {
      if (!shouldLog('debug')) return
      console.debug(`[Alternate][debug] ${message}`, meta ?? '')
    },
    info(message, meta) {
      if (!shouldLog('info')) return
      console.info(`[Alternate][info] ${message}`, meta ?? '')
    },
    warn(message, meta) {
      if (!shouldLog('warn')) return
      console.warn(`[Alternate][warn] ${message}`, meta ?? '')
    },
    error(message, meta) {
      if (!shouldLog('error')) return
      console.error(`[Alternate][error] ${message}`, meta ?? '')
    }
  }
}