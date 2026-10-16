# @mframework/meeovi-player

One media player for every app: video, audio, live video and radio. It's
built on **Video.js 10** (`@videojs/html` 10.1, the custom-elements rewrite),
not the classic `video.js` 8 package, and set up the way Video.js's Vue/Nuxt
installation guide describes (packaged skins, hls.js for HLS, Google Cast).

```vue
<MeeoviPlayer :src="videoUrl" :poster="thumbUrl" :title="name" />
<MeeoviPlayer :src="trackUrl" kind="audio" title="Episode 4" />
<MeeoviPlayer :src="stationUrl" live title="Meeovi Radio" />     <!-- radio -->
<MeeoviPlayer src="https://stream.mux.com/<id>.m3u8" />          <!-- HLS, auto -->
```

| Prop | |
| --- | --- |
| `src` | Media URL. With no `src`, shows "Video/Audio is not available". |
| `kind` | `video` \| `audio` \| `live-video` \| `live-audio`. Detected when omitted: from `type`, else from the file extension. |
| `live` | Live stream (radio, live video): a Live button instead of a seek bar. |
| `type` | MIME type, e.g. a Directus file's `type`. Picks audio or video, and HLS. |
| `poster`, `title` | Poster image (video) and content title. Both are set on the player (`poster`, `content-title`), so the skin shows them. |
| `autoplay`, `muted`, `loop`, `preload` | As on `<video>`. `preload` defaults to `metadata`. |
| `skin` | `default`, `neutral` or `compat` (closest to the Video.js 8 look). Defaults to the module's `skin`. |
| `aspectRatio` | Video box ratio, default `16 / 9`. |

Events: `play`, `pause`, `ended`, `error` (the media element's native events).
Exposed via a template ref: `player` (the player element; its `store` holds
playback state and actions), `media` (the underlying media element), and
`play()` / `pause()`, which go through the player's store so they keep working
while casting.

## How it works

- Each kind maps to a Video.js 10 preset: `<video-player>`, `<audio-player>`,
  `<live-video-player>` or `<live-audio-player>`. Each player contains its
  packaged skin, which contains the media element: native `<video>`/`<audio>`,
  or for `.m3u8` and `application/x-mpegURL`, `<hlsjs-video>` (hls.js, via
  `@videojs/hlsjs-video`) for video and `<hls-audio>` for audio.
- Video and live-video players include the `<google-cast>` extension
  (`@videojs/google-cast`). The packaged skins already have the Cast and
  AirPlay buttons; the Cast SDK only loads in Chromium browsers that can cast.
  The Cast device fetches the media itself, so sources must be publicly
  reachable with CORS headers.
- The elements are registered client-side (the guide's client-only option for
  Nuxt): only the preset, skin, media and extension a page actually shows are
  loaded, and the component waits for `customElements.whenDefined` before
  rendering the player. The server renders a same-sized placeholder, so
  there's no hydration mismatch.
- Skins include their own styles; there's no CSS to import.
- The module adds the exact Video.js tags to Vue's `isCustomElement`, in both
  `vue.compilerOptions` and `vite.vue.template.compilerOptions` (this Nuxt
  version doesn't forward the former to Vite). It also pre-bundles the Video.js
  entries for dev.

## Setup

```jsonc
// app package.json
"dependencies": {
  "@mframework/meeovi-player": "file:../../../packages/plugins/Media/meeovi-player"
}
```

```ts
// nuxt.config.ts
modules: ['@mframework/meeovi-player'],
meeoviPlayer: { skin: 'default' }, // optional
```

**Content-Security-Policy:** `media-src` must allow your media origins and
`blob:` (hls.js uses Media Source Extensions). `worker-src` needs `blob:` for
hls.js workers. `connect-src` must allow HLS manifest and segment origins.
Google Cast needs `https://www.gstatic.com` in `script-src`. The shared
layer's CSP already allows all of these, plus Mux, Directus and Pixanomy.

## Adding sources

YouTube, Vimeo, Mux, Mux Data, DASH and similar are optional Video.js
adapter packages (`@videojs/youtube-video`, …). Get version-matched setup
with `npx @videojs/cli agents init --framework vue --template nuxt` from the
app directory. To support one, install it
and add its element to `runtime/loaders.ts` and the template. Their
embed origins also need adding to the CSP; see
`node_modules/@videojs/html/docs/guides/content-security-policy.md`.
Video.js's own docs ship with the package under `node_modules/@videojs/html/docs/`.
