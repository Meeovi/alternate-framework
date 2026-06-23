import { AuditEntry } from '../domain/audit.js';

export interface AuditStorage {
  write(entry: AuditEntry): Promise<void>;
}

export interface RateLimitRecord {
  key: string;
  windowMs: number;
  max: number;
  count: number;
  resetAt: Date;
}

export interface RateLimitStorage {
  get(key: string, windowMs: number): Promise<RateLimitRecord | null>;
  increment(key: string, windowMs: number, max: number): Promise<RateLimitRecord>;
}
