import mframeworkAdapter from '../adapters/mframeworkApiAdapter'
import mastoAdapter from '../adapters/mastoAdapter'
import { getSocialConfig } from '../../app/composables/config'

export default () => {
  // register on the server global so server handlers can use it
  try {
    const cfg = getSocialConfig()
    let adapter: any = undefined
    // provider values: 'memory' | 'mastodon' | 'mframework'
    if (cfg.provider === 'mastodon') adapter = mastoAdapter
    else if (cfg.provider === 'mframework' || cfg.provider === 'mframework-api') adapter = mframeworkAdapter
    // if adapter is undefined we intentionally leave it to fall back to in-memory handlers
    ;(globalThis as any).__adapterServer = adapter
  } catch (err) {
    // ignore
  }
}
