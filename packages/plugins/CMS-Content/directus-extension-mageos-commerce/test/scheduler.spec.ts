import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMirrorScheduler } from '../src/mirror/scheduler'

describe('createMirrorScheduler', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  const setup = (runTime = 0) => {
    const runs: string[] = []
    let finish: (() => void) | null = null
    const run = vi.fn((section: string) => {
      runs.push(section)
      return runTime ? new Promise<void>((resolve) => { finish = resolve }) : Promise.resolve()
    })
    const scheduler = createMirrorScheduler(run as never, { debounceMs: 3000, minIntervalMs: 10000, now: () => Date.now() })
    return { runs, scheduler, finish: () => finish?.() }
  }

  it('turns a burst of pings into one run, after the debounce', async () => {
    const { runs, scheduler } = setup()
    expect(scheduler.request('orders')).toBe('scheduled')
    expect(scheduler.request('orders')).toBe('joined')
    await vi.advanceTimersByTimeAsync(2999)
    expect(runs).toEqual([])
    await vi.advanceTimersByTimeAsync(1)
    expect(runs).toEqual(['orders'])
  })

  it('queues exactly one follow-up for pings during a run', async () => {
    const { runs, scheduler, finish } = setup(1)
    scheduler.request('orders')
    await vi.advanceTimersByTimeAsync(3000)
    expect(scheduler.request('orders')).toBe('queued')
    expect(scheduler.request('orders')).toBe('queued')
    finish()
    await vi.advanceTimersByTimeAsync(0)
    // The follow-up waits for the minimum interval since the last start.
    await vi.advanceTimersByTimeAsync(9999)
    expect(runs).toEqual(['orders'])
    await vi.advanceTimersByTimeAsync(1)
    expect(runs).toEqual(['orders', 'orders'])
  })

  it('never starts a section more than once per interval, however often it is pinged', async () => {
    const { runs, scheduler } = setup()
    for (let t = 0; t < 30_000; t += 500) {
      scheduler.request('orders')
      await vi.advanceTimersByTimeAsync(500)
    }
    expect(runs.length).toBeLessThanOrEqual(3)
  })

  it('keeps sections independent and reports failures without stopping', async () => {
    const onError = vi.fn()
    const scheduler = createMirrorScheduler(async (section) => { if (section === 'customers') throw new Error('down') }, { debounceMs: 10, minIntervalMs: 10, onError })
    scheduler.request('orders')
    scheduler.request('customers')
    await vi.advanceTimersByTimeAsync(10)
    expect(onError).toHaveBeenCalledWith('customers', expect.objectContaining({ message: 'down' }))
    expect(scheduler.request('customers')).toBe('scheduled')
    scheduler.stop()
  })
})
