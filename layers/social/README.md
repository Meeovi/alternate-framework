
---

# 📦 `@meeovi/social` — README.md  
*(This one is more advanced because of caching, SWR, retry, metrics, etc.)*

```md
# @meeovi/social

A powerful, backend‑agnostic social integration layer for Meeovi.  
Supports ATProto (Bluesky), Mastodon, WordPress/BuddyPress, and any custom social backend.

## ✨ Features

- Pluggable social providers  
- Unified `useSocial()` composable  
- Unified activity feed abstraction  
- Caching (TTL‑based)  
- Stale‑While‑Revalidate (SWR) background refresh  
- Retry + exponential backoff  
- Provider‑specific rate‑limit strategies  
- Analytics hooks (per‑provider metrics)  
- Unified error model  

## 📦 Installation

```sh
npm install @meeovi/social

🧩 Usage

import { useSocial } from '@meeovi/social'

const { getActivityFeed } = useSocial()

const feed = await getActivityFeed('sebastian')
🔌 Providers

export interface SocialProvider {
  getProfile(handle: string): Promise<SocialProfile>
  listPosts(handle: string): Promise<SocialPost[]>
  createPost?(content: string): Promise<SocialPost>
}
Register:


registerSocialProvider('mastodon', MastodonProvider)
🧠 Advanced Features
Caching

cacheKey: `atproto:posts:${handle}`,
ttlMs: 30000
SWR (Stale‑While‑Revalidate)

swr: true
Retry + Backoff

retry: true
Provider‑Specific Rate Limits

setRateLimit('mastodon', { maxRequests: 10, windowMs: 60000 })
Metrics

import { getMetrics } from '@meeovi/social'

console.log(getMetrics('atproto'))
🧱 Folder Structure
Code
src/
  providers/
  config.
  registry.
  useSocial.
  cache.
  retry.
  swr.
  rateLimit.
  metrics.
  utils.