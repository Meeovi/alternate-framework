Video plugin folder
====================

Any JS files placed under this folder will be auto-registered as Video.js plugins on client-side app boot.

Auto-registration rules
----------------------

- Files are discovered via a build-time glob and registered automatically when the app runs in the browser.
- The plugin name is derived from the file base name (e.g. `hls.js` -> `hls`).
- If a module exports a `name` property, that value will be used instead of the filename.
- Modules should default-export the plugin function (or export an object with a `default` property).

Example plugin file (`hls.js`)
------------------------------

```js
export default function hls(player, options = {}) {
  // plugin code
}
```

Manual registration
-------------------

If you need to register plugins manually (for example dynamically or from another module), you can use the registration helpers exposed by the shared Nuxt plugin.

From a component or composable:

```js
const nuxtApp = useNuxtApp()
// register single
nuxtApp.$registerVideojsPlugin('hls', hls)

// register multiple
nuxtApp.$registerVideojsPlugins({ hls: hls, other: otherPlugin })
```

Or via the `useVideojs` composable:

```js
import useVideojs from '~/layers/shared-app/app/composables/media/useVideojs'
const { registerVideojsPlugin } = useVideojs()
registerVideojsPlugin('hls', hls)
```

Notes
-----

- Auto-registration runs only on the client (browser) to avoid server-side Video.js init.
- Keep plugin modules small — this folder is intended for thin helpers that call into the Video.js player API.
