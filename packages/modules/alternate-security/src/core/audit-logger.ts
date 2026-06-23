import { AuditStorage } from '../ports/storage.js';
import { AuditEntry, AuditAction } from '../domain/audit.js';
import { Clock } from '../ports/clock.js';
import { CryptoPort } from '../ports/crypto.js';

export class AuditLogger {
  constructor(
    private readonly storage: AuditStorage,
    private readonly clock: Clock,
    private readonly crypto: CryptoPort
  ) {}

  async log(
    action: AuditAction,
    data: Omit<AuditEntry, 'id' | 'action' | 'createdAt'>
  ): Promise<void> {
    const entry: AuditEntry = {
      id: this.crypto.randomId(),
      action,
      createdAt: this.clock.now(),
      ...data
    };
    await this.storage.write(entry);
  }
}
