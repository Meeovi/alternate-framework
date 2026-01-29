let shared = null;
try {
    // Try to use the centralized shared helper at runtime when available
    // Use require to avoid TypeScript resolving the module at compile-time for this layer project
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    shared = require('../../../shared/app/utils/env');
}
catch (e) {
    shared = null;
}
export * from '@shared-utils/env';
export { default } from '@shared-utils/env';
