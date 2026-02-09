# Media module

This module provides an automatic Video.js player attachment utility with dynamic plugin loading, per-namespace plugin mapping, and merged plugin options.

## Features

- Auto-initialize `<video>` and `<audio>` elements with Video.js on the client.
- Dynamically import and register Video.js plugins (or fall back to globals).
- Per-namespace `pluginsMap` to resolve plugin specifiers to remote `src`, `name`, and `defaultOptions`.
- Merge plugin default options with per-element options specified via `data-plugins-options`.
- Observe DOM mutations and auto-initialize newly added media elements.

## API

- `setupAutoAttach(opts?)` - main entry. Returns `{ videojs, disconnect }`.

Options (all optional):

- `plugins: PluginSpec[]` — array of plugin specs to register by default. Each `PluginSpec` can be a string (plugin name/module specifier) or an object `{ name, src?, defaultOptions? }`.
- `pluginsMap: Record<string, PluginSpec>` — map plugin key → `PluginSpec`. Useful for mapping short names to `{ src, name, defaultOptions }` objects.
- `playerOptions: any` — default options passed to `videojs()` when creating a player.
- `selector: string` — CSS selector used to find media elements; defaults to `video:not([data-mframework-media-initialized]), audio:not([data-mframework-media-initialized])`.

Behavior notes:

- Plugin resolution: when a plugin is specified as a string (e.g. `hotkeys`) and a `pluginsMap` contains an entry for that key, the mapped `PluginSpec` is used.
- Plugin registration: the module will attempt to `import()` the module (if `src` or string is an importable specifier). If import fails it will look for a global named after the plugin or `videojs-<name>`.
- Plugin initialization: after the player is created, the module will call the plugin initializer on the player instance with merged options `{ ...defaultOptions, ...elementOptions }` where `elementOptions` come from `data-plugins-options`.

## HTML attributes

- `data-plugins="hotkeys,qualitySwitcher"` — comma-separated plugin keys for this element. Keys resolve to `pluginsMap` entries if present, otherwise treated as literal plugin names/module specifiers.
- `data-plugins-options='{"hotkeys": {"seekStep": 10}, "qualitySwitcher": {"default": "720p"}}'` — JSON object with per-plugin options for this element. Keys should match plugin `name` (or use dashed vs underscore alternatives).
- `data-player-options='{"controls": true, "autoplay": false}'` — JSON object of options passed to `videojs()` for this element.

## Window globals for auto-run

The module's `useMedia` automatically calls `setupAutoAttach()` on the client when imported. You can configure it from the page by setting the following globals before DOMContentLoaded:

- `window.MFRAMEWORK_MEDIA_PLUGINS` — array of plugin specs (same format as `plugins` option).
- `window.MFRAMEWORK_MEDIA_PLUGINS_MAP` — plugin map (see `pluginsMap` option) to resolve shorthand keys to `{ name, src, defaultOptions }`.

Example:

```html
<script>
	// map short key to a remote plugin and provide default options
	window.MFRAMEWORK_MEDIA_PLUGINS_MAP = {
		hotkeys: { name: 'hotkeys', src: '/libs/videojs-hotkeys.js', defaultOptions: { seekStep: 5 } },
		quality: { name: 'qualitySwitcher', src: '/libs/videojs-quality.js', defaultOptions: { default: '720p' } }
	}

	// enable two default plugins globally (can be overridden per-element)
	window.MFRAMEWORK_MEDIA_PLUGINS = ['hotkeys', 'quality']
</script>

<video controls data-plugins="hotkeys,quality" data-plugins-options='{"hotkeys":{"seekStep":10}}' width="640">
	<source src="/media/clip.mp4" type="video/mp4">
</video>
```

In this example `hotkeys` resolves to the `hotkeys` entry in `MFRAMEWORK_MEDIA_PLUGINS_MAP`. The plugin will be registered (dynamic import or global), and after the player is created the plugin initializer will be called with merged options `{ seekStep: 5, seekStep: 10 }` — the element-level value overrides the default.

## Manual usage

If you prefer to call setup manually (for example in an SPA route):

```js
import { setupAutoAttach } from '@mframework/media'

const { videojs, disconnect } = await setupAutoAttach({
	plugins: [{ name: 'hotkeys', src: '/libs/videojs-hotkeys.js', defaultOptions: { seekStep: 5 } }],
	pluginsMap: { hotkeys: { name: 'hotkeys', src: '/libs/videojs-hotkeys.js' } },
	playerOptions: { controls: true }
})

// when you want to stop observing for new elements
disconnect()
```

## Testing locally

1. Make sure `video.js` is available to your client bundle (install via your app's package manager or include a CDN script).
2. Serve a test page with the HTML example above and confirm the player initializes and the plugin is invoked with merged options.

Example quick test commands (run from project root):

```bash
# build dev server
npm run dev

# open a local page that includes the video example and the built assets
# (use your browser to verify console logs and plugin behavior)
```

## Notes

- The module tolerates missing plugins: it will attempt imports, then fall back to globals and skip plugins that cannot be registered.
- Per-element `data-plugins` takes precedence over the `plugins` option when present on an element.
- Plugin option keys can use dashed or underscored names; the code attempts a basic fallback when looking up element options.

If you want an example test page committed to this package, I can add a minimal `test/index.html` and a small dev script — would you like that?

