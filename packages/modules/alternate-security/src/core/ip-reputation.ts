import { EventBus } from './event-bus.js';
import { SecurityLogger } from '../ports/logger.js';
import { Clock } from '../ports/clock.js';

export interface IpReputationOptions {
  suspiciousThreshold: number;
  windowMs: number;
}

interface IpRecord {
  count: number;
  firstSeen: Date;
}

export class IpReputationService {
  #ips = new Map<string, IpRecord>();

  constructor(
    private readonly bus: EventBus,
    private readonly logger: SecurityLogger,
    private readonly clock: Clock,
    private readonly opts: IpReputationOptions
  ) {}

  async record(ip: string, reason: string, context?: Record<string, unknown>) {
    const now = this.clock.now();
    const existing = this.#ips.get(ip);

    if (!existing) {
      this.#ips.set(ip, { count: 1, firstSeen: now });
      return;
    }

    const age = now.getTime() - existing.firstSeen.getTime();
    if (age > this.opts.windowMs) {
      this.#ips.set(ip, { count: 1, firstSeen: now });
      return;
    }

    existing.count += 1;
    if (existing.count >= this.opts.suspiciousThreshold) {
      this.logger.warn('Suspicious IP activity', { ip, reason, context });
      await this.bus.publish({
        type: 'security.suspicious-activity',
        occurredAt: now,
        payload: {
          ip,
          reason,
          context
        }
      });
      this.#ips.delete(ip);
    }
  }
}
