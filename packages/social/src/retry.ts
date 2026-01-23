export interface RetryOptions {
  retries: number
  baseDelayMs: number
  maxDelayMs: number
}

const defaultRetry: RetryOptions = {
  retries: 3,
  baseDelayMs: 300,
  maxDelayMs: 5000
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: Partial<RetryOptions> = {}
): Promise<T> {
  const { retries, baseDelayMs, maxDelayMs } = { ...defaultRetry, ...opts }

  let attempt = 0

  while (true) {
    try {
      return await fn()
    } catch (err: any) {
      attempt++
      if (attempt > retries) throw err

      const delay = Math.min(
        baseDelayMs * Math.pow(2, attempt) + Math.random() * 100,
        maxDelayMs
      )

      await sleep(delay)
    }
  }
}
