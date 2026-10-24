import type { MirrorSection } from './sync'

/**
 * Turns "something changed" pings into mirror runs: a ping schedules one run
 * of its section after `debounceMs` (more pings meanwhile join it), a ping
 * during a run queues exactly one follow-up run, and runs of a section start
 * at least `minIntervalMs` apart. So a burst of saves (an order, its invoice,
 * its status) costs one run, and no stream of pings can cost more than one
 * run per interval.
 */

export type ScheduleState = 'scheduled' | 'joined' | 'queued'

export interface MirrorScheduler {
  request(section: MirrorSection): ScheduleState
  /** Pending timers, for tests and shutdown. */
  stop(): void
}

export function createMirrorScheduler(
  run: (section: MirrorSection) => Promise<unknown>,
  options: { debounceMs: number, minIntervalMs: number, now?: () => number, onError?: (section: MirrorSection, error: unknown) => void },
): MirrorScheduler {
  const now = options.now ?? Date.now
  const timers = new Map<MirrorSection, ReturnType<typeof setTimeout>>()
  const running = new Set<MirrorSection>()
  const again = new Set<MirrorSection>()
  const lastStart = new Map<MirrorSection, number>()

  function schedule(section: MirrorSection) {
    const earliest = (lastStart.get(section) ?? -Infinity) + options.minIntervalMs
    const delay = Math.max(options.debounceMs, earliest - now())
    timers.set(section, setTimeout(() => void start(section), delay))
  }

  async function start(section: MirrorSection) {
    timers.delete(section)
    running.add(section)
    lastStart.set(section, now())
    try {
      await run(section)
    } catch (error) {
      options.onError?.(section, error)
    } finally {
      running.delete(section)
      if (again.delete(section)) schedule(section)
    }
  }

  return {
    request(section) {
      if (running.has(section)) {
        again.add(section)
        return 'queued'
      }
      if (timers.has(section)) return 'joined'
      schedule(section)
      return 'scheduled'
    },
    stop() {
      for (const timer of timers.values()) clearTimeout(timer)
      timers.clear()
    },
  }
}
