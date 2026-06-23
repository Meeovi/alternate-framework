import { Principal } from '../domain/principals.js';
import {
  PermissionCheckContext,
  PermissionDecision
} from '../domain/permissions.js';
import { Policy } from '../domain/policies.js';
import { EventBus } from './event-bus.js';
import { SecurityLogger } from '../ports/logger.js';
import { CryptoPort } from '../ports/crypto.js';
import { Clock } from '../ports/clock.js';
import { AuditStorage } from '../ports/storage.js';
import { AuditEntry } from '../domain/audit.js';

export interface AccessControlOptions {
  policies: Policy[];
  eventBus: EventBus;
  logger: SecurityLogger;
  crypto: CryptoPort;
  clock: Clock;
  auditStorage: AuditStorage;
}

export class AccessControl {
  constructor(private readonly opts: AccessControlOptions) {}

  async check(
    principal: Principal | null,
    context: PermissionCheckContext
  ): Promise<PermissionDecision> {
    for (const policy of this.opts.policies) {
      const decision = policy.evaluate(principal, context);
      if (!decision.allowed) {
        await this.logAndEmit(principal, context, decision, false);
        return decision;
      }
    }

    const decision: PermissionDecision = { allowed: true };
    await this.logAndEmit(principal, context, decision, true);
    return decision;
  }

  private async logAndEmit(
    principal: Principal | null,
    context: PermissionCheckContext,
    decision: PermissionDecision,
    allowed: boolean
  ) {
    const now = this.opts.clock.now();
    const entry: AuditEntry = {
      id: this.opts.crypto.randomId(),
      action: allowed ? 'access.granted' : 'access.denied',
      principalId: principal?.id,
      resource: context.resource,
      metadata: {
        action: context.action,
        reason: decision.reason
      },
      createdAt: now
    };

    await this.opts.auditStorage.write(entry);

    if (allowed) {
      await this.opts.eventBus.publish({
        type: 'security.access.granted',
        occurredAt: now,
        payload: {
          userId: principal?.id,
          resource: context.resource,
          action: context.action
        }
      });
      this.opts.logger.debug('Access granted', {
        principalId: principal?.id,
        resource: context.resource,
        action: context.action
      });
    } else {
      await this.opts.eventBus.publish({
        type: 'security.access.denied',
        occurredAt: now,
        payload: {
          userId: principal?.id,
          resource: context.resource,
          action: context.action,
          reason: decision.reason ?? 'Denied'
        }
      });
      this.opts.logger.warn('Access denied', {
        principalId: principal?.id,
        resource: context.resource,
        action: context.action,
        reason: decision.reason
      });
    }
  }
}
