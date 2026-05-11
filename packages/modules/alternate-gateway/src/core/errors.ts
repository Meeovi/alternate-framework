export class MeeoviError extends Error {
  code?: string
  cause?: unknown

  constructor(message: string, options?: { code?: string; cause?: unknown }) {
    super(message)
    this.name = 'MeeoviError'
    this.code = options?.code
    this.cause = options?.cause
  }
}

export function isMFrameworkError(err: unknown): err is MeeoviError {
  return err instanceof MeeoviError
}