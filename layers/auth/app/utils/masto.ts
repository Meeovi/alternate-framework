import { shallowRef } from 'vue'

export function createMasto() {
  // Minimal client stub used by the auth layer plugin at build time
  return {
    client: shallowRef(undefined as any),
    streamingClient: shallowRef(undefined as any),
  }
}

// Note: do not export a default here to avoid creating a global auto-import
// symbol (`masto`) that can collide with server-side utilities or other
// modules. Use the named `createMasto` export instead.
