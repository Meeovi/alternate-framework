# @mframework/bookmarkit

Bookmarks for M Framework, as a Nuxt module. A signed-in user sees all their
bookmarks in a responsive grid. From there they can add, edit, move and delete
bookmarks, sort them into folders, and search them.

Bookmarks live in Directus, in the lists the site already has:

- **Folders:** each folder is one of the user's `lists` with the `lists_type`
  "Bookmarks". So folders also appear in the user's lists, with the bookmark
  icon.
- **Bookmarks:** each bookmark is a `list_items` row in one of those folders.
  Its `title`, `link` and `description` hold the bookmark's title, address and
  note.

The server checks every request against the signed-in user's own folders. An id
that belongs to someone else gets a 404, exactly like an id that doesn't exist.

## What you get

| | |
| --- | --- |
| `/bookmarks` | The bookmarks page, made of the `<Bookmarkit />` component below |
| `<Bookmarkit />` | The manager: search, folder chips, the grid, and dialogs to add, edit, move and delete bookmarks and to create, rename and delete folders. Guests see a sign-in link. Registered globally |
| `useBookmarks()` | The same data and actions, for your own UI (auto-imported) |
| `/api/bookmarks` | The API below |

The grid fits as many columns of at least 260 px as the screen allows, and
drops to one column on a phone.

## Install

The module lives in this monorepo and is consumed from source; there's no
build step.

1. Add it to the app's dependencies and register it in `nuxt.config.ts`:

   ```jsonc
   // package.json
   "@mframework/bookmarkit": "file:../../../packages/plugins/Social/bookmarkit"
   ```

   ```ts
   // nuxt.config.ts
   export default defineNuxtConfig({
     modules: ['@mframework/bookmarkit'],
   })
   ```

2. Run `npm install` at the repository root.

It needs three things from the app:

- **Vuetify**, for the components.
- **Sign-in:** better-auth's `/api/auth/get-session`, from the auth layer.
- **Directus:** a `lists_type` named "Bookmarks", and a token that can read
  and write `lists`, `list_items`, `lists_directus_users`, `lists_type_lists` and
  `lists_type`. Meeovi's "Meeovi app server" token already can.

## Configuration

By default the module uses the app's own Directus settings, read when the
server starts. Nothing is copied into the build, so after a token is rotated a
restart is enough.

| Variable | Default | |
| --- | --- | --- |
| `NUXT_BOOKMARKIT_DIRECTUS_URL` | `DIRECTUS_URL` | Directus' address |
| `NUXT_BOOKMARKIT_DIRECTUS_TOKEN` | `NUXTUS_DIRECTUS_STATIC_TOKEN` | A static token with the access above. Server-only |

Options in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@mframework/bookmarkit'],
  bookmarkit: {
    page: '/bookmarks',           // false: no page, place <Bookmarkit /> yourself
    apiBase: '/api/bookmarks',
    listType: 'Bookmarks',        // the Directus lists_type a folder has
    loginPath: '/login',          // guests' sign-in link (?redirect= back)
    sessionEndpoint: '/api/auth/get-session',
    enabled: true,                // false registers nothing
  },
})
```

## Using it in a page

```vue
<template>
  <Bookmarkit />
</template>
```

In a layer that some apps run without this module, render it only when it's
installed:

```ts
const bookmarkit = useRuntimeConfig().public.bookmarkit ? resolveComponent('Bookmarkit') : null
// <component :is="bookmarkit" v-if="bookmarkit" />
```

The social layer's `/lists` page does this in its Bookmarks tab.

### Your own UI

```ts
const { bookmarks, folders, signedIn, add, update, remove, addFolder, updateFolder, removeFolder } = useBookmarks()

await add({ url: 'https://nuxt.com', title: 'Nuxt' })      // into the oldest folder
await add({ url: 'vuejs.org', folderId: folders.value[1].id }) // https:// is added
await update(id, { title: 'Nuxt docs', folderId: other.id })   // edit or move
```

Every call to `useBookmarks()` on a page shares one copy of the data. Each action
saves on the server, then reloads the data.

## API

Every route needs a signed-in user, and answers 401 otherwise.

| Route | Body | Answer |
| --- | --- | --- |
| `GET /api/bookmarks` | | `{ folders: [{ id, name, description, count }], bookmarks: [{ id, title, url, description, folderId, createdAt }] }`, newest bookmark first |
| `POST /api/bookmarks` | `{ url, title?, description?, folderId? }` | 201 and the bookmark. Without a `folderId` it goes in the oldest folder, and a "Bookmarks" folder is made if there is none. Without a title, the site's name is used |
| `PATCH /api/bookmarks/:id` | any of `url`, `title`, `description`, `folderId` | the bookmark |
| `DELETE /api/bookmarks/:id` | | 204 |
| `POST /api/bookmarks/folders` | `{ name, description? }` | 201 and the folder |
| `PATCH /api/bookmarks/folders/:id` | `{ name?, description? }` | the folder |
| `DELETE /api/bookmarks/folders/:id` | | 204. Deletes the folder and every bookmark in it |

Validation, answered with a 400:

- **`url`:** http or https only, at most 2,048 characters. A bare `example.com`
  gets `https://` added. `javascript:` and `data:` links are refused, because
  they would run when clicked.
- **Lengths:** a title is at most 200 characters, a note 1,000, and a folder
  name 80.

Folders and bookmarks that aren't the user's answer 404.

Deleting a folder removes its bookmarks and its owner and type rows first. In
Directus, deleting a list on its own only empties those references, which would
leave the rows behind.

For your own server routes, the helpers are in
`@mframework/bookmarkit/server`: `requireUser`, `listFolders`, `requireFolder`,
`listBookmarks`, `requireBookmark`, `readUrl` and the others.

## Development

```bash
cd packages/plugins/Social/bookmarkit
npx vitest run     # API tests against an in-memory Directus
npx tsc --noEmit   # type-check
```

To see the UI, run an app that has the module (for example
`apps/ecosystem/meeovi-frontend`) and open `/bookmarks`. The playground needs
Vuetify and a session endpoint before it is useful.
