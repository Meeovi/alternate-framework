// Registers the Video.js 10 custom elements (<video-player>, <media-*>, ...)
// used declaratively in app/components/blocks/*.vue — this is a pure
// side-effecting import (the elements self-initialize via the Custom
// Elements lifecycle once registered), there is no imperative player API
// to set up. @videojs/html has no `window.videojs` global and no
// `new videojs.Player()` factory — that API belongs to the older,
// unrelated classic `video.js` package.
import '@videojs/html/video/player'
import '@videojs/html/video/skin'

export default defineNuxtPlugin(() => {})
