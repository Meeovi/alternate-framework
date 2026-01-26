# nuxt-activitypub

A Nuxt module that integrates [ActivityPub](https://www.w3.org/TR/activitypub/) into your Nuxt application.  
It provides a preconfigured HTTP client for ActivityPub endpoints and composables for common federation tasks.

---

## 🚀 Features
- Injects an ActivityPub client into your Nuxt app (`$activitypub`).
- Configurable server endpoint via `nuxt.config.ts`.
- Provides a `useActivitypub` composable for inbox/outbox queries and posting activities.
- Secure by default: runtime config, no secrets hardcoded.

---

## Usage

const { getInbox } = useActivitypub()
const inbox = await getInbox()
console.log(inbox)

const { getOutbox } = useActivitypub()
const outbox = await getOutbox()
console.log(outbox)

const { postActivity } = useActivitypub()
await postActivity({
  "@context": "https://www.w3.org/ns/activitystreams",
  type: "Note",
  content: "Hello Fediverse from Nuxt!"
})

---

## 📦 Installation

Add the module to your project:

```bash
pnpm add nuxt-activitypub
npm install nuxt-activitypub
yarn add nuxt-activitypub
```

Then, add it to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-activitypub'],

  activitypub: {
    server: 'https://mastodon.social' // or your own ActivityPub server
  }
})
```
