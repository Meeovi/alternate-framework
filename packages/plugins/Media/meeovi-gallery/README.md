# @mframework/meeovi-gallery

The signed-in user's media gallery for M Framework apps: everything they've uploaded anywhere in Meeovi, which is stored on Pixanomy (Nextcloud, app.pixanomy.com) by the app's `/api/assets/upload`.

- **`<MeeoviGallery>`**: the whole gallery in [SVAR File Manager](https://svar.dev/vue/filemanager/), with a folder for each upload category (posts, vibez, avatars…) and each month inside it. Photos show as thumbnails. Files open in a viewer (photos full size; videos and audio in `<MeeoviPlayer>` when that plugin is installed) or download. New files can be uploaded into the open folder.
- **`<MeeoviRelatedMedia>`**: a slider of the user's latest photos and videos, to drop into any page. Renders nothing for guests.
- **`<MeeoviMediaViewer>`**: the viewer both use, for your own components.
- **`/connect/media`**: a page with `<MeeoviGallery>` (signed-in only).

Moving, renaming and deleting are left out on purpose: posts, profiles and spaces link to these files, so changing them in the gallery would break those pages.

## Setup

In an app of this monorepo: add it to the root `package.json` workspaces and the app's dependencies (`"@mframework/meeovi-gallery": "file:../../../packages/plugins/Media/meeovi-gallery"`), then register it by name:

```ts
export default defineNuxtConfig({
  modules: ['@mframework/meeovi-gallery'],
  meeoviGallery: {
    // all optional
    page: '/connect/media',          // false = no page
    apiBase: '/api/gallery',
    uploadEndpoint: '/api/assets/upload',
    uploadCategory: 'gallery',       // folder for uploads made at the gallery's top level
  },
})
```

It needs Vuetify, the auth layer's `/api/auth/get-session`, and the app's Pixanomy settings (`NUXT_PIXANOMY_URL`, `NUXT_PIXANOMY_USERNAME`, `NUXT_PIXANOMY_APP_PASSWORD`, `NUXT_PIXANOMY_ROOT`, read from `runtimeConfig.pixanomy` at runtime). `meeoviGallery.pixanomy` overrides them if the gallery should read somewhere else.

## Components

```vue
<!-- full gallery -->
<MeeoviGallery />
<MeeoviGallery height="480px" mode="table" />

<!-- slider: title, type (media | image | video | audio), limit, link, show-empty -->
<MeeoviRelatedMedia />
<MeeoviRelatedMedia title="Your videos" type="video" :limit="8" />
<MeeoviRelatedMedia :link="false" :show-empty="false" />

<!-- viewer -->
<MeeoviMediaViewer v-model="open" :item="{ kind: 'image', url, name }" />
```

`useGalleryMedia({ limit, type })` returns the same data as the slider (`media`, `signedIn`, `status`, `refresh`) for custom layouts.

## Server routes

Both need a signed-in user and only ever read that user's own folder (`<root>/<user id>`; the id comes from the session). Responses are `Cache-Control: private, no-store`.

- `GET /api/gallery/files`: `{ files, drive: { used } }`, the gallery as SVAR File Manager entries (folders and files; files carry `url`, `shareUrl`, `contentType`, `kind`).
- `GET /api/gallery/recent?limit=12&type=media|image|video|audio`: `{ media }`, the latest uploads with their public links (limit 1–50).

Each listing is one WebDAV SEARCH plus one OCS share-list call, not one call per file.

## Tests

```sh
npm test            # vitest: the routes against a fake Nextcloud, and the tree shaping
npm run typecheck
```
