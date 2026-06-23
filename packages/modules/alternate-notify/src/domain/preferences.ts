import { NotificationChannelType } from './types.js';

export interface ChannelPreference {
  channel: NotificationChannelType;
  enabled: boolean;
  quietHours?: {
    start: string; // "22:00"
    end: string;   // "07:00"
    timezone: string;
  };
}

export interface UserPreferences {
  userId: string;
  channels: ChannelPreference[];
}

export function isChannelEnabled(
  prefs: UserPreferences | null,
  channel: NotificationChannelType,
  now: Date = new Date()
): boolean {
  if (!prefs) return true;
  const pref = prefs.channels.find(c => c.channel === channel);
  if (!pref) return true;
  if (!pref.enabled) return false;

  if (!pref.quietHours) return true;

  const { start, end } = pref.quietHours;
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes < endMinutes) {
    return !(currentMinutes >= startMinutes && currentMinutes < endMinutes);
  } else {
    return currentMinutes < startMinutes && currentMinutes >= endMinutes;
  }
}
