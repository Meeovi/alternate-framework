export const logger = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('[mframework:api-client]', ...args)
    }
  },
  warn: (...args: any[]) => {
    console.warn('[mframework:api-client]', ...args)
  },
  error: (...args: any[]) => {
    console.error('[mframework:api-client]', ...args)
  }
}
