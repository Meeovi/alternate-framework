// This file is intentionally empty.
// Add shared utility exports here as needed.

/**
 * Cross-environment UUID v4 generator.
 * Uses Web Crypto `randomUUID` when available (browser, Node ≥ 19 with Web Crypto),
 * and falls back to a Math.random-based RFC 4122 v4 implementation for environments
 * where globalThis.crypto.randomUUID is not exposed (certain Nitro/unenv builds).
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
