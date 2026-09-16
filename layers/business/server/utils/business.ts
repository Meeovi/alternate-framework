import { BusinessDriverRegistry } from 'alternate-sdk'
import type { BusinessDriverContract } from 'alternate-sdk/contracts'

/**
 * Returns the business/seller driver, resolved backend-agnostically via
 * `alternate-sdk`'s `BusinessDriverRegistry` — mirrors
 * `layers/social/server/utils/social.ts`'s `getSocialDriver()`.
 *
 * `server/plugins/register-business-driver.ts` registers the default
 * driver once at Nitro startup via `setDefaultBusinessDriver`, which
 * writes into this same `BusinessDriverRegistry`. This uses a static
 * import (not `require('alternate-sdk')`) so both call sites resolve the
 * exact same module instance — a runtime `require()` of an ESM package can
 * load a second, separate module instance with its own registry state,
 * making a plugin-set default invisible here.
 */
export function getBusinessDriver(): BusinessDriverContract {
  return (BusinessDriverRegistry.getDefaultDriver() as BusinessDriverContract | undefined) || ({} as BusinessDriverContract)
}
