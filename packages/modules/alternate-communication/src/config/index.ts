import { CommunicationStorageAdapter } from '../ports/storage';
import { RealtimeAdapter } from '../ports/realtime';
import { CommunicationSearchAdapter } from '../ports/search';
import { CommunicationMediaAdapter } from '../ports/media';
import { CommunicationNotificationAdapter } from '../ports/notifications';
import { CommunicationPolicy } from '../domain/policy/CommunicationPolicy';

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export interface AlternateCommunicationOptions {
  storage: CommunicationStorageAdapter;
  realtime: RealtimeAdapter;
  search?: CommunicationSearchAdapter;
  media?: CommunicationMediaAdapter;
  notifications?: CommunicationNotificationAdapter;
  policy?: CommunicationPolicy;
  logger?: Logger;
}
