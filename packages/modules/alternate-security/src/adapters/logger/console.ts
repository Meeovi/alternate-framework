import { SecurityLogger } from '../../ports/logger.js';

export class ConsoleSecurityLogger implements SecurityLogger {
  debug(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.debug('[security:debug]', message, meta ?? '');
  }
  info(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.info('[security:info]', message, meta ?? '');
  }
  warn(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.warn('[security:warn]', message, meta ?? '');
  }
  error(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.error('[security:error]', message, meta ?? '');
  }
}
