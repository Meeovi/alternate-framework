# UI Shell layer

The shared UI structure for the apps: layouts, menus, blocks, the Vuetify and PWA plugins, and the Vuetify/PWA/fonts/image modules.

## Using it in an app

Add the layer to the app's `useLayers` call (which also creates the `#ui` alias), and pick the app's layout:

```ts
const layers = useLayers(__dirname, {
  ui: '../../../layers/ui-shell',
})

export default defineNuxtConfig({
  extends: layers.extends(),
  appConfig: {
    uiShell: { layout: 'elitenovels' },
  },
})
```

`uiShell.layout` names a file in `app/layouts/`. It becomes the app's `default` layout, and this layer's other layouts are left out of the app's build; list any you still want in `uiShell.layouts` (meeovi-frontend keeps `nolive` and `settings`). Layouts from other layers (auth, search…) are unaffected.

| App | `uiShell.layout` | Menus / blocks |
| --- | --- | --- |
| meeovi-frontend | `default` | `components/menus/`, `components/blocks/` |
| elitenovels | `elitenovels` | `components/menus/elitenovels/`, `components/blocks/elitenovels/` |
| pixanomy-frontend | `pixanomy` | `components/menus/pixanomy/`, `components/blocks/pixanomy/` |
| business-frontend, starter-template | `starter` | `components/menus/starter/`, `components/blocks/starter/` (plus the shared `menus/`, `blocks/Newsletter.vue`) |

Apps must not ship their own `plugins/vuetify.ts`, `plugins/pwa.client.ts` or `vite-plugin-vuetify` — Nuxt runs plugins from every layer, so a second copy creates a second Vuetify instance. Apps should also depend on `"@mframework/ui-shell": "file:../../../layers/ui-shell"` so a workspace-scoped install (Vercel) pulls in this layer's modules.

PWA: `pwa.manifest.icons` defaults to the `/icons/icon-{96,192,512}x…png` (+ `.maskable`) set in each app's `public/icons/`. An app that lists its own icons gets only its own — layer arrays are concatenated, so ui-shell drops its defaults from the merged list.

## Layer development

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Working on your layer

Your layer is at the root of this repository, it is exactly like a regular Nuxt project, except you can publish it on NPM.

The `.playground` directory should help you on trying your layer during development.

Running `pnpm dev` will prepare and boot `.playground` directory, which imports your layer itself.

## Distributing your layer

Your Nuxt layer is shaped exactly the same as any other Nuxt project, except you can publish it on NPM.

To do so, you only have to check if `files` in `package.json` are valid, then run:

```bash
npm publish --access public
```

Once done, your users will only have to run:

```bash
npm install --save your-layer
```

Then add the dependency to their `extends` in `nuxt.config`:

```ts
defineNuxtConfig({
  extends: 'your-layer'
})
```

## Development Server

Start the development server on http://localhost:3000

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Or statically generate it with:

```bash
pnpm generate
```

Locally preview production build:

```bash
pnpm preview
```

Checkout the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
