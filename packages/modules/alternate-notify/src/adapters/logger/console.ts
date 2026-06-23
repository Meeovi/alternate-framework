import { NotifyLogger } from '../../ports/logger.js';

export class ConsoleLogger implements NotifyLogger {
  debug(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.debug('[notify:debug]', message, meta ?? '');
  }
  info(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.info('[notify:info]', message, meta ?? '');
  }
  warn(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.warn('[notify:warn]', message, meta ?? '');
  }
  error(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.error('[notify:error]', message, meta ?? '');
  }
}
