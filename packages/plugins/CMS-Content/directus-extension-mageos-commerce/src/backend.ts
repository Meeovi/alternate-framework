import type { ICommerceAdapter } from './adapters/base.adapter'
import { MageOsAdapter } from './adapters/mage-os.adapter'
import type { CommerceConfig } from './config'

/** The one place that knows which backend is in use. */
export function createAdapter(config: CommerceConfig): ICommerceAdapter {
  return new MageOsAdapter({
    url: config.mageos.url,
    token: config.mageos.token,
    consumerKey: config.mageos.consumerKey,
    consumerSecret: config.mageos.consumerSecret,
    tokenSecret: config.mageos.tokenSecret,
    storeCode: config.mageos.storeCode,
    timeoutMs: config.mageos.timeoutMs,
    categoryDepth: config.mageos.categoryDepth,
  })
}
