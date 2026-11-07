# @mframework/meeovi-video-bookmarks

Sellers add videos to the site by pasting a link from **YouTube, Vimeo, Dailymotion, TikTok or PeerTube**.
A linked video becomes a free (price 0) product in the store (Mage-OS, under the seller) in
**Theater → Videos**, beside uploaded videos, and opens on the product page (`/product/<key>`) in the
platform's own player.

## Adult content is refused

Every link is checked before anything is created (`runtime/server/safety.ts`, `providers.ts`):

- **Supported platforms only.** Unknown sites are refused outright. Twitch, Rumble and Streamable aren't
  supported: the first two refuse server reads and Streamable has no content flag, so the checks below
  couldn't run on them.
- **Adult hosts:** adult TLDs (.xxx, .porn, .sex, .adult), adult words in the host, and a list of adult sites.
  This matters for PeerTube, where members name the instance.
- **The platform's own flag:**
  - Dailymotion's `explicit` flag.
  - PeerTube's `nsfw` flag, and NSFW instances as a whole.
  - YouTube's age restriction. This needs `YOUTUBE_API_KEY`; without it YouTube still refuses to play
    age-restricted videos in an embed.
- **Text checks:** the address, title, description, channel and tags, and the seller's own title and
  description. Matching is done after undoing look-alikes (p0rn, n.s.f.w, "p o r n"). Weak words only match as
  whole words, so place names and ordinary words that contain them pass.
- **Store approval:** the store's product approval follows, and every product page has the Report button.

## Use

`modules: ['@mframework/meeovi-video-bookmarks']` (registered in layers/social).

- `<AddVideoLink />` is the "Add video" button and dialog. It only shows for sellers. It's on the Videos
  category page and in Workspace → My products.
- `<VideoEmbed embed-url provider title />` is the platform player. The product page uses it when a product
  has `video_link_embed_url`.
- `POST /api/video-bookmarks/preview { url }` checks a link without adding it.
- `POST /api/video-bookmarks { url, name, description? }` creates the store product.

| Option | Default | |
| --- | --- | --- |
| `departmentSlug` / `categorySlug` | `theater` / `videos` | where linked videos are listed |
| `dailyLimit` | 30 | videos a seller can add per 24 hours |
| `blockedTerms` / `blockedHosts` | `[]` | extra adult words / hosts |

Env:
- `YOUTUBE_API_KEY`: optional; turns on YouTube's age-restriction check.
- `VIDEO_BOOKMARKS_BLOCKED_TERMS` / `VIDEO_BOOKMARKS_BLOCKED_HOSTS`: comma lists.

Directus `products` fields: `video_link_url`, `video_link_embed_url`, `video_link_provider`,
`video_link_id` (provider:id, so a video is only added once).
