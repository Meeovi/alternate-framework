/**
 * Ambient shims so the module's sources type-check in isolation. At runtime
 * these come from Nuxt/Nitro and the packages themselves (no bundled types).
 */
declare module '#imports' {
  export function useRuntimeConfig(event?: unknown): Record<string, any>
  export function useState<T>(key: string, init?: () => T): import('vue').Ref<T>
}
declare module 'create-torrent' {
  export default function createTorrent(input: unknown, opts: Record<string, unknown>, cb: (error: Error | null, torrent: Uint8Array) => void): void
}
declare module 'bencode' {
  const bencode: { encode(value: unknown): Uint8Array, decode(data: Uint8Array): unknown }
  export default bencode
}
declare function $fetch<T = unknown>(url: string, opts?: Record<string, unknown>): Promise<T>
