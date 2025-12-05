# nuxt-atproto

A Nuxt module that integrates the [AT Protocol](https://atproto.com) into your Nuxt application.  
It provides a preconfigured `AtpAgent` client via Nuxt’s injection system and a composable for common operations.

---

## 🚀 Features
- Injects an `AtpAgent` instance into your Nuxt app (`$atproto`).
- Configurable service endpoint via `nuxt.config.ts`.
- Provides a `useAtproto` composable for login, registration, posting, and timeline fetching.
- Secure by default: runtime config, no secrets hardcoded.

---

## Usage

const { getTimeline } = useAtproto()
const feed = await getTimeline(20)

const { createPost } = useAtproto()
await createPost('Hello world from Meeovi!')

const { login } = useAtproto()
await login('user@example.com', 'password123')

---

## 📦 Installation

Add the module to your project:

```bash
pnpm add nuxt-atproto
npm install nuxt-atproto
