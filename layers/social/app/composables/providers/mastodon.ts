import type { SocialProvider } from '../core/types'
import { registerSocialProvider } from '../core/registry'
import AdapterFederationProvider from './adapter-federation'

const MastodonProvider: SocialProvider = AdapterFederationProvider

registerSocialProvider('mastodon', MastodonProvider)

export default MastodonProvider
