import {
  AddressStorage,
  NotificationLogStorage,
  PreferenceStorage
} from '../../ports/storage.js';
import { UserPreferences } from '../../domain/preferences.js';
import { UserChannelAddresses, NotificationPayload } from '../../domain/types.js';

export class InMemoryPreferenceStorage implements PreferenceStorage {
  private store = new Map<string, UserPreferences>();

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    return this.store.get(userId) ?? null;
  }

  async setUserPreferences(prefs: UserPreferences): Promise<void> {
    this.store.set(prefs.userId, prefs);
  }
}

export class InMemoryAddressStorage implements AddressStorage {
  private store = new Map<string, UserChannelAddresses>();

  async getUserAddresses(userId: string): Promise<UserChannelAddresses | null> {
    return this.store.get(userId) ?? null;
  }

  async setUserAddresses(addresses: UserChannelAddresses): Promise<void> {
    this.store.set(addresses.userId, addresses);
  }
}

export class InMemoryNotificationLogStorage implements NotificationLogStorage {
  private logs: NotificationPayload[] = [];

  async logNotification(payload: NotificationPayload): Promise<void> {
    this.logs.push(payload);
  }

  getAll(): NotificationPayload[] {
    return this.logs;
  }
}
