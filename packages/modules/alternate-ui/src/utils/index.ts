export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function createUID(prefix = 'aui'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
}

export function noop(): void {}
