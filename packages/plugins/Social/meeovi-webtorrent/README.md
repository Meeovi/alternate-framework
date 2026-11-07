# @mframework/meeovi-webtorrent

Opt-in peer-to-peer playback for M Framework. Members who turn it on in
Settings → Accounts stream videos and vibez from other viewers over
WebTorrent (WebRTC), and share what they watch while it plays. The original
file is always the web seed, so a video plays even when nobody else is
watching.

## How it works

- `GET /api/webtorrent/torrent?src=<video URL>` builds the video's
  `.torrent` once: it reads the file, hashes its pieces and caches the
  result for 7 days in Nitro's `cache` storage (Redis in production). The
  same video always gets the same info hash. Only https videos on
  `sourceHosts` can be shared. At most 2 torrents are built at a time, and
  files over `maxBytes` are refused.
- `GET /api/webtorrent/seed/<id>` is the web seed: the original file served
  from this site with Range support. Pixanomy share links redirect and send
  no CORS headers, which browsers' WebTorrent can't follow.
- `/_webtorrent/webtorrent.min.js` and `/_webtorrent/sw.min.js` are the
  WebTorrent 3.0.21 browser client and its service-worker stream handler,
  vendored unchanged (MIT, see `runtime/public/`). The client is loaded only
  for members who opted in.
- Streams are served by a service worker. In production that is the PWA's
  (`@vite-pwa/nuxt` generateSW): the module adds
  `importScripts('/_webtorrent/sw.min.js')` through
  `pwa:beforeBuildServiceWorker`. A custom injectManifest worker must import
  it itself. In dev, where there's no PWA worker, WebTorrent's own worker is
  registered at `/`.
- `useWebTorrentSource(() => url)` returns `{ src, status, peers, enabled }`.
  Give `src` to the player: it is the P2P stream once it's running, otherwise
  the original. It falls back to the original if there's no WebRTC or
  service worker, if the torrent can't be made, or if nothing starts within
  10 seconds.
- `<WebTorrentPeers :source="p2p" />` shows "P2P · 3 peers".

## Setup

```ts
modules: ['@mframework/meeovi-webtorrent'],
meeoviWebtorrent: {
  // trackers: ['wss://tracker.openwebtorrent.com', 'wss://tracker.webtorrent.dev'],
  // sourceHosts: ['app.pixanomy.com'],
  // maxBytes: 300 * 1024 * 1024,
},
```

| Env | |
| --- | --- |
| `WEBTORRENT_TRACKERS` | Comma-separated `wss://` trackers. layers/shared adds them to the CSP `connect-src`. |
| `WEBTORRENT_SOURCE_HOSTS` | Hosts videos may come from. Default `app.pixanomy.com` plus the host of `DIRECTUS_URL` (older vibez are Directus assets). |
| `WEBTORRENT_MAX_BYTES` | Default 300 MB. |
| `WEBTORRENT_SEED_ORIGIN` | Where peers fetch the web seed. Default `NUXT_PUBLIC_SITE_URL`. Torrents are cached per origin. |

## Privacy

Peers see each other's IP addresses, as in any peer-to-peer app. That's why
it is off unless a member turns it on, and Settings says so.

## Tests

`npm test`: source rules, media sniffing, and the torrent's web seed,
trackers and stable info hash.
