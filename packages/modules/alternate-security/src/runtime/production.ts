import { EventBus } from '../core/event-bus.js';
import { ConsoleSecurityLogger } from '../adapters/logger/console.js';
import { InMemoryAuditStorage, InMemoryRateLimitStorage } from '../adapters/storage/in-memory.js';
import { AccessControl } from '../core/access-control.js';
import { RateLimiter } from '../core/rate-limiter.js';
import { AuditLogger } from '../core/audit-logger.js';
import { IpReputationService } from '../core/ip-reputation.js';
import { RoleBasedPolicy } from '../domain/policies.js';
import { Clock } from '../ports/clock.js';
import { CryptoPort } from '../ports/crypto.js';
import { defaultSecurityConfig, AlternateSecurityConfig } from '../config.js';

class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

class RandomCrypto implements CryptoPort {
  randomId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function createProductionSecurityModule(
  config: AlternateSecurityConfig = defaultSecurityConfig()
) {
  const clock = new SystemClock();
  const crypto = new RandomCrypto();
  const eventBus = new EventBus();
  const logger = new ConsoleSecurityLogger();

  const auditStorage = new InMemoryAuditStorage();
  const rateLimitStorage = new InMemoryRateLimitStorage(clock);

  const policies = [
    new RoleBasedPolicy(config.roles ?? {})
  ];

  const accessControl = new AccessControl({
    policies,
    eventBus,
    logger,
    crypto,
    clock,
    auditStorage
  });

  const rateLimiter = new RateLimiter(
    rateLimitStorage,
    clock,
    eventBus,
    logger,
    {
      windowMs: config.rateLimit?.windowMs ?? 60_000,
      max: config.rateLimit?.max ?? 60,
      keyPrefix: config.rateLimit?.keyPrefix ?? 'rl'
    }
  );

  const auditLogger = new AuditLogger(auditStorage, clock, crypto);

  const ipReputation = new IpReputationService(
    eventBus,
    logger,
    clock,
    {
      suspiciousThreshold: config.ipReputation?.suspiciousThreshold ?? 10,
      windowMs: config.ipReputation?.windowMs ?? 5 * 60_000
    }
  );

  return {
    eventBus,
    logger,
    accessControl,
    rateLimiter,
    auditLogger,
    ipReputation,
    auditStorage,
    rateLimitStorage,
    clock,
    crypto
  };
}
