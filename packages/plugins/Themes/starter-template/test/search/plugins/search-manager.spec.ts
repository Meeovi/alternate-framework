import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock defineNuxtPlugin to just return the function passed so we can call it directly
vi.mock('nuxt/app', () => ({ defineNuxtPlugin: (fn: any) => fn }))

import plugin from '../../app/plugins/search-manager'

describe('search-manager plugin', () => {
  beforeEach(() => {
    // Clear any global manager between tests
    ;(globalThis as any).searchManager = undefined
  })

  afterEach(() => {
    ;(globalThis as any).searchManager = undefined
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('sets $searchManager when event bus emits adapter:registered', async () => {
    const listeners: Record<string, Function> = {}
    const bus = {
      on: (ev: string, cb: Function) => {
        listeners[ev] = cb
      },
      emit: (ev: string, payload: any) => {
        if (listeners[ev]) listeners[ev](payload)
      }
    }

    const provided: Record<string, any> = {}
    const nuxtApp: any = {
      _context: { eventBus: bus },
      provide: (k: string, v: any) => { provided[k] = v },
    }

    // initialize plugin
    const res = plugin(nuxtApp)
    expect(typeof res).toBe('object')

    // now register the manager on the app and emit event
    const mgr = { id: 'manager1' }
    nuxtApp.searchManager = mgr

    // simulate adapter registration
    if (listeners['adapter:registered']) listeners['adapter:registered']({ key: 'search' })

    expect(nuxtApp.$searchManager).toBe(mgr)
    expect(provided.searchManager).toBe(mgr)
  })

  it('polls globalThis.searchManager as a fallback', async () => {
    vi.useFakeTimers()

    const nuxtApp: any = {
      // no bus, no searchManager initially
      _context: {},
      provide: vi.fn()
    }

    plugin(nuxtApp)

    // After some time, globalThis.searchManager is set by runtime
    const mgr = { id: 'global-mgr' }
    setTimeout(() => { (globalThis as any).searchManager = mgr }, 400)

    // advance timers to trigger plugin polling (interval 200ms).
    // setTimeout sets globalThis at 400ms; next poll occurs at 600ms, so advance to 700ms
    vi.advanceTimersByTime(700)

    expect(nuxtApp.$searchManager).toBe(mgr)
  })

  it('sets $searchManager when event bus emits app:ready', async () => {
    const listeners: Record<string, Function> = {}
    const bus = {
      on: (ev: string, cb: Function) => { listeners[ev] = cb },
      emit: (ev: string, payload: any) => { if (listeners[ev]) listeners[ev](payload) }
    }

    const provided: Record<string, any> = {}
    const nuxtApp: any = {
      _context: { eventBus: bus },
      provide: (k: string, v: any) => { provided[k] = v },
    }

    // initialize plugin
    plugin(nuxtApp)

    // set manager then emit app:ready
    const mgr = { id: 'ready-mgr' }
    nuxtApp.searchManager = mgr
    if (listeners['app:ready']) listeners['app:ready']()

    expect(nuxtApp.$searchManager).toBe(mgr)
    expect(provided.searchManager).toBe(mgr)
  })
})
