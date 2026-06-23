import { RateLimitStorage } from '../ports/storage.js';
import { Clock } from '../ports/clock.js';
import { EventBus } from './event-bus.js';
import { SecurityLogger } from '../ports/logger.js';

export interface RateLimitOptions {
  keyPrefix?: string;
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export class RateLimiter {
  constructor(
    private readonly storage: RateLimitStorage,
    private readonly clock: Clock,
    private readonly bus: EventBus,
    private readonly logger: SecurityLogger,
    private readonly opts: RateLimitOptions
  ) {}

  async check(key: string, meta?: { ip?: string; userId?: string }): Promise<RateLimitResult> {
    const fullKey = `${this.opts.keyPrefix ?? 'rl'}:${key}`;
    const record = await this.storage.increment(
      fullKey,
      this.opts.windowMs,
      this.opts.max
    );

    const remaining = Math.max(this.opts.max - record.count, 0);
    const allowed = record.count <= this.opts.max;

    if (!allowed) {
      this.logger.warn('Rate limit hit', { key: fullKey, meta });
      await this.bus.publish({
        type: 'security.rate-limit.hit',
        occurredAt: this.clock.now(),
        payload: {
          key: fullKey,
          limit: this.opts.max,
          windowMs: this.opts.windowMs,
          ip: meta?.ip,
          userId: meta?.userId
        }
      });
    }

    return {
      allowed,
      remaining,
      resetAt: record.resetAt
    };
  }
}
