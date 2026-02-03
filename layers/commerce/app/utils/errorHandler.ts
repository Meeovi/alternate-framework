export const errorHandler = {
  handle(err: unknown) {
    // Structured handling: log and optionally rethrow
    try {
      if (err instanceof Error) {
        console.error(`[Commerce][Error] ${err.name}: ${err.message}`)
      } else {
        console.error('[Commerce][Error]', err)
      }
    } catch (e) {
      console.error('Error while handling error', e)
    }
  }
}

export default errorHandler
