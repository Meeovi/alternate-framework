export const logger = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('[mframework:api]', ...args)
    }
  },
  warn: (...args: any[]) => {
    console.warn('[mframework:api]', ...args)
  },
  error: (...args: any[]) => {
    console.error('[mframework:api]', ...args)
  }
}
