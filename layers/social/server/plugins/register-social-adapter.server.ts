import mframeworkAdapter from '../adapters/mframeworkApiAdapter'
import adapterFederationAdapter from '../adapters/adapterFederationAdapter'
import { getSocialConfig } from '../../app/composables/core/config'

export default () => {
  // register on the server global so server handlers can use it
  try {
    const cfg = getSocialConfig()
    let adapter: any = undefined
    // provider values: 'memory' | 'adapter-federation' | 'mastodon' | 'mframework'
    if (cfg.provider === 'adapter-federation' || cfg.provider === 'mastodon') adapter = adapterFederationAdapter
    else if (cfg.provider === 'mframework' || cfg.provider === 'mframework-api') adapter = mframeworkAdapter
    // if adapter is undefined we intentionally leave it to fall back to in-memory handlers
    ;(globalThis as any).__adapterServer = adapter
  } catch (err) {
    // ignore
  }
}
