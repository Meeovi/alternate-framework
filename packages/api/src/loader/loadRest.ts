import { registerRestEndpoint } from '../rest/registry'
import type { RestEndpoint } from '../rest/types'

export function loadRest() {
  const modules = (import.meta as any).glob('../rest/*.ts', { eager: true })

  for (const path in modules) {
    const mod = modules[path] as Record<string, RestEndpoint>
    for (const key in mod) {
      registerRestEndpoint(key, mod[key])
    }
  }
}
