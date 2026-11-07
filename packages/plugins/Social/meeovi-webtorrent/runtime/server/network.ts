// Nitro plugin: registers "webtorrent" in the social layer's federation
// registry — not a social network, just the opt-in members turn on in
// Settings → Accounts (the social layer stores the switch).
import { defineNitroPlugin } from 'nitropack/runtime'

const FEDERATION_REGISTRY = Symbol.for('meeovi.federation.networks')

export default defineNitroPlugin(() => {
  const g = globalThis as Record<symbol, unknown>
  if (!(g[FEDERATION_REGISTRY] instanceof Map)) g[FEDERATION_REGISTRY] = new Map()
  ;(g[FEDERATION_REGISTRY] as Map<string, unknown>).set('webtorrent', {
    id: 'webtorrent',
    label: 'WebTorrent',
    async status() {
      return { configured: true, connected: true, service: 'Peer-to-peer playback', account: null, detail: 'Members who opt in stream videos from each other' }
    },
    connection: {
      kind: 'opt-in',
      description: 'Play videos and vibez peer-to-peer: your browser streams them from other viewers and shares what you watch, which takes load off Meeovi. Playback falls back to the normal stream when no one else is watching.',
      notice: 'While a video plays, other viewers can see your IP address, as with any peer-to-peer app. Uses your upload bandwidth only while the page is open.',
    },
  })
})
