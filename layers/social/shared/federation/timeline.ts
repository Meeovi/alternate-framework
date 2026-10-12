export type TimelineEntry<T = unknown> = {
  id: string
  protocol: string
  createdAt: string
  payload: T
}

function toEpoch(createdAt: string): number {
  const value = new Date(createdAt).getTime()
  return Number.isFinite(value) ? value : 0
}

export function mergeProtocolTimelines<T = unknown>(
  sources: Array<Array<TimelineEntry<T>>>,
  limit = 50,
): Array<TimelineEntry<T>> {
  const deduped = new Map<string, TimelineEntry<T>>()

  for (const source of sources) {
    for (const entry of source) {
      if (!entry?.id) continue
      const key = `${entry.protocol}:${entry.id}`
      if (!deduped.has(key)) {
        deduped.set(key, entry)
      }
    }
  }

  return [...deduped.values()]
    .sort((a, b) => toEpoch(b.createdAt) - toEpoch(a.createdAt))
    .slice(0, limit)
}

export function encodeSyncCursor(input: { protocol: string; createdAt: string; id: string }): string {
  return Buffer.from(JSON.stringify(input), 'utf8').toString('base64url')
}

export function decodeSyncCursor(cursor: string): { protocol: string; createdAt: string; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8')
    const parsed = JSON.parse(decoded)
    if (typeof parsed?.protocol !== 'string' || typeof parsed?.createdAt !== 'string' || typeof parsed?.id !== 'string') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}
