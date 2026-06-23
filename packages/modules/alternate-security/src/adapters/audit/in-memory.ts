import {
  AuditStorage,
} from '../../ports/storage.js';
import { AuditEntry } from '../../domain/audit.js';

export class InMemoryAuditStorage implements AuditStorage {
  #entries: AuditEntry[] = [];

  async write(entry: AuditEntry): Promise<void> {
    this.#entries.push(entry);
  }

  getAll(): AuditEntry[] {
    return this.#entries;
  }
}