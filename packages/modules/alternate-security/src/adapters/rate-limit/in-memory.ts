import {
  RateLimitStorage,
  RateLimitRecord
} from '../../ports/storage.js';
import { Clock } from '../../ports/clock.js';

export class InMemoryRateLimitStorage implements RateLimitStorage {
  #records = new Map<string, RateLimitRecord>();

  constructor(private readonly clock: Clock) {}

  async get(key: string, windowMs: number): Promise<RateLimitRecord | null> {
    const rec = this.#records.get(key);
    if (!rec) return null;

    const now = this.clock.now();
    if (now > rec.resetAt) {
      this.#records.delete(key);
      return null;
    }

    return rec;
  }

  async increment(
    key: string,
    windowMs: number,
    max: number
  ): Promise<RateLimitRecord> {
    const now = this.clock.now();
    const existing = await this.get(key, windowMs);

    if (!existing) {
      const rec: RateLimitRecord = {
        key,
        windowMs,
        max,
        count: 1,
        resetAt: new Date(now.getTime() + windowMs)
      };
      this.#records.set(key, rec);
      return rec;
    }

    existing.count += 1;
    return existing;
  }
}