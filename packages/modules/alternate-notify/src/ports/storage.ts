import { UserPreferences } from '../domain/preferences.js';
import { UserChannelAddresses } from '../domain/types.js';
import { NotificationPayload } from '../domain/types.js';

export interface PreferenceStorage {
  getUserPreferences(userId: string): Promise<UserPreferences | null>;
  setUserPreferences(prefs: UserPreferences): Promise<void>;
}

export interface AddressStorage {
  getUserAddresses(userId: string): Promise<UserChannelAddresses | null>;
  setUserAddresses(addresses: UserChannelAddresses): Promise<void>;
}

export interface NotificationLogStorage {
  logNotification(payload: NotificationPayload): Promise<void>;
}
