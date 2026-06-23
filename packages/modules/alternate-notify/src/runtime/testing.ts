import { createProductionNotificationModule } from './production.js';

export function createTestingNotificationModule() {
  const mod = createProductionNotificationModule();
  // swap out external adapters with no-op or in-memory if desired
  return mod;
}
