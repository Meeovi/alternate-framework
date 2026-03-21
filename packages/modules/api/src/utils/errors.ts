export class MFrameworkError extends Error {
  status?: number

  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

export function assert(condition: any, message: string, status = 400) {
  if (!condition) {
    throw new MFrameworkError(message, status)
  }
}
