import { createProductionSecurityModule } from './production.js';
import { AlternateSecurityConfig } from '../config.js';

export function createTestingSecurityModule(
  config?: Partial<AlternateSecurityConfig>
) {
  return createProductionSecurityModule({
    ...config
  });
}
