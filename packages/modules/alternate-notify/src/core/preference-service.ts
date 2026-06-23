import { PreferenceStorage } from '../ports/storage.js';
import { UserPreferences } from '../domain/preferences.js';

export class PreferenceService {
  constructor(private readonly storage: PreferenceStorage) {}

  get(userId: string): Promise<UserPreferences | null> {
    return this.storage.getUserPreferences(userId);
  }

  set(prefs: UserPreferences): Promise<void> {
    return this.storage.setUserPreferences(prefs);
  }
}
