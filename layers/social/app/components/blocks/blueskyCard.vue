<template>
  <ScriptBlueskyEmbed post-url="https://bsky.app/profile/bsky.app/post/3mgnwwvj3u22a">
    <template #default="{ displayName, handle, avatar, richText, datetime, likes, likesFormatted, reposts, repostsFormatted, replies, images, externalEmbed, postUrl, authorUrl }">
      <div class="bsky-card">
        <div class="d-flex align-center bsky-gap-3 bsky-px-4 bsky-pt-4 bsky-pb-3">
          <a :href="authorUrl" target="_blank" rel="noopener noreferrer" class="bsky-shrink-0">
            <img :src="avatar" :alt="displayName" class="bsky-avatar">
          </a>
          <a :href="authorUrl" target="_blank" rel="noopener noreferrer" class="bsky-min-w-0 bsky-no-underline">
            <div class="bsky-name">{{ displayName }}</div>
            <div class="bsky-handle">@{{ handle }}</div>
          </a>
          <a :href="postUrl" target="_blank" rel="noopener noreferrer" class="bsky-butterfly" aria-label="View on Bluesky">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 568 501" fill="currentColor">
              <path d="M123.121 33.664C188.241 82.553 258.281 181.68 284 234.873c25.719-53.192 95.759-152.32 160.879-201.21C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555c-20.275 72.453-94.155 90.933-159.875 79.748c114.875 19.831 144.097 85.561 81.022 151.291C363.929 569.326 289.18 462.062 284 449.7c-.36-.86-.36-.86 0 0c-5.18 12.362-79.929 119.626-189.369 5.84c-63.075-65.729-33.853-131.46 81.022-151.29c-65.72 11.184-139.6-7.296-159.875-79.749C9.945 203.659 0 75.291 0 57.946C0-28.906 76.134-1.612 123.121 33.664" />
            </svg>
          </a>
        </div>

        <div class="bsky-px-4 bsky-pb-2">
          <div class="bsky-richtext" v-html="richText" />
        </div>

        <div v-if="images?.length" class="bsky-px-4 bsky-pb-2">
          <div class="bsky-media" :class="images.length > 1 ? 'bsky-media--grid' : ''">
            <img v-for="(img, i) in images" :key="i" :src="img.fullsize" :alt="img.alt" class="bsky-media__img" :class="images.length > 1 ? 'bsky-media__img--square' : ''">
          </div>
        </div>

        <div v-if="externalEmbed" class="bsky-px-4 bsky-pb-2">
          <a :href="externalEmbed.uri" target="_blank" rel="noopener noreferrer" class="bsky-ext">
            <img v-if="externalEmbed.thumb" :src="externalEmbed.thumb" class="bsky-ext__thumb">
            <div class="bsky-ext__body">
              <div class="bsky-ext__title">{{ externalEmbed.title }}</div>
              <div class="bsky-ext__desc">{{ externalEmbed.description }}</div>
              <div class="bsky-ext__host">
                <svg fill="none" viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M4.4 9.493C4.14 10.28 4 11.124 4 12a8 8 0 1 0 10.899-7.459l-.953 3.81a1 1 0 0 1-.726.727l-3.444.866-.772 1.533a1 1 0 0 1-1.493.35L4.4 9.493Zm.883-1.84L7.756 9.51l.44-.874a1 1 0 0 1 .649-.52l3.306-.832.807-3.227a7.993 7.993 0 0 0-7.676 3.597ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm8.43.162a1 1 0 0 1 .77-.29l1.89.121a1 1 0 0 1 .494.168l2.869 1.928a1 1 0 0 1 .336 1.277l-.973 1.946a1 1 0 0 1-.894.553h-2.92a1 1 0 0 1-.831-.445L9.225 14.5a1 1 0 0 1 .126-1.262l1.08-1.076Z" /></svg>
                {{ hostname(externalEmbed.uri) }}
              </div>
            </div>
          </a>
        </div>

        <div class="bsky-px-4 bsky-pt-1 bsky-pb-3">
          <a :href="postUrl" target="_blank" rel="noopener noreferrer" class="bsky-time">
            {{ datetime }}
          </a>
        </div>

        <div v-if="likes || reposts || replies" class="bsky-stats">
          <a v-if="likes" :href="`${postUrl}/liked-by`" target="_blank" rel="noopener noreferrer" class="bsky-stat">
            <span class="bsky-stat__count">{{ likesFormatted }}</span> likes
          </a>
          <span v-if="reposts" class="bsky-stat">
            <span class="bsky-stat__count">{{ repostsFormatted }}</span> reposts
          </span>
        </div>

        <div class="bsky-actions">
          <div class="d-flex align-center bsky-gap-8">
            <button class="bsky-action" aria-label="Reply">
              <svg fill="none" width="20" viewBox="0 0 24 24" height="20"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M20 7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2a1 1 0 0 1 1 1v1.918l3.375-2.7a1 1 0 0 1 .625-.218h5a2 2 0 0 0 2-2V7Zm2 8a4 4 0 0 1-4 4h-4.648l-4.727 3.781A1.001 1.001 0 0 1 7 22v-3H6a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v8Z" /></svg>
            </button>
            <button class="bsky-action bsky-action--repost" aria-label="Repost">
              <svg fill="none" width="20" viewBox="0 0 24 24" height="20"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M17.957 2.293a1 1 0 1 0-1.414 1.414L17.836 5H6a3 3 0 0 0-3 3v3a1 1 0 1 0 2 0V8a1 1 0 0 1 1-1h11.836l-1.293 1.293a1 1 0 0 0 1.414 1.414l2.47-2.47a1.75 1.75 0 0 0 0-2.474l-2.47-2.47ZM20 12a1 1 0 0 1 1 1v3a3 3 0 0 1-3 3H6.164l1.293 1.293a1 1 0 1 1-1.414 1.414l-2.47-2.47a1.75 1.75 0 0 1 0-2.474l2.47-2.47a1 1 0 0 1 1.414 1.414L6.164 17H18a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1Z" /></svg>
            </button>
            <button class="bsky-action bsky-action--like" aria-label="Like">
              <svg fill="none" width="20" viewBox="0 0 24 24" height="20"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M16.734 5.091c-1.238-.276-2.708.047-4.022 1.38a1 1 0 0 1-1.424 0C9.974 5.137 8.504 4.814 7.266 5.09c-1.263.282-2.379 1.206-2.92 2.556C3.33 10.18 4.252 14.84 12 19.348c7.747-4.508 8.67-9.168 7.654-11.7-.541-1.351-1.657-2.275-2.92-2.557Zm4.777 1.812c1.604 4-.494 9.69-9.022 14.47a1 1 0 0 1-.978 0C2.983 16.592.885 10.902 2.49 6.902c.779-1.942 2.414-3.334 4.342-3.764 1.697-.378 3.552.003 5.169 1.286 1.617-1.283 3.472-1.664 5.17-1.286 1.927.43 3.562 1.822 4.34 3.764Z" /></svg>
            </button>
          </div>
          <a :href="postUrl" target="_blank" rel="noopener noreferrer" class="bsky-action" aria-label="Open on Bluesky">
            <svg fill="none" width="20" viewBox="0 0 24 24" height="20"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M11.839 4.744c0-1.488 1.724-2.277 2.846-1.364l.107.094 7.66 7.256.128.134c.558.652.558 1.62 0 2.272l-.128.135-7.66 7.255c-1.115 1.057-2.953.267-2.953-1.27v-2.748c-3.503.055-5.417.41-6.592.97-.997.474-1.525 1.122-2.084 2.14l-.243.46c-.558 1.088-2.09.583-2.08-.515l.015-.748c.111-3.68.777-6.5 2.546-8.415 1.83-1.98 4.63-2.771 8.438-2.884V4.744Z" /></svg>
          </a>
        </div>
      </div>
    </template>

    <template #loading>
      <div class="bsky-card bsky-p-4">
        <div class="bsky-skeleton d-flex bsky-gap-3">
          <div class="bsky-skel-avatar" />
          <div class="bsky-skel-lines">
            <div class="bsky-skel-line" style="width:33%" />
            <div class="bsky-skel-line bsky-skel-line--sm" style="width:25%" />
          </div>
        </div>
        <div class="bsky-skeleton bsky-mt-3 bsky-skel-lines">
          <div class="bsky-skel-line" style="width:100%" />
          <div class="bsky-skel-line" style="width:83%" />
          <div class="bsky-skel-line" style="width:66%" />
        </div>
      </div>
    </template>

    <template #error>
      <div class="bsky-card bsky-p-4 bsky-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 568 501" fill="currentColor" class="bsky-error__icon"><path d="M123.121 33.664C188.241 82.553 258.281 181.68 284 234.873c25.719-53.192 95.759-152.32 160.879-201.21C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555c-20.275 72.453-94.155 90.933-159.875 79.748c114.875 19.831 144.097 85.561 81.022 151.291C363.929 569.326 289.18 462.062 284 449.7c-.36-.86-.36-.86 0 0c-5.18 12.362-79.929 119.626-189.369 5.84c-63.075-65.729-33.853-131.46 81.022-151.29c-65.72 11.184-139.6-7.296-159.875-79.749C9.945 203.659 0 75.291 0 57.946C0-28.906 76.134-1.612 123.121 33.664" /></svg>
        Failed to load post
      </div>
    </template>
  </ScriptBlueskyEmbed>
</template>

<script setup lang="ts">
function hostname(url: string) {
  return new URL(url).hostname
}
</script>

<style scoped>
/* Self-contained styling. Tailwind arbitrary-value classes (bg-[#151d28],
   text-[15px], …) don't generate in this repo's Tailwind v4 pipeline, so
   the card's exact colours and sizes live here — light on the root, dark
   for both prefers-color-scheme and an explicit Vuetify dark theme. */
.bsky-card {
  --bsky-surface: #ffffff;
  --bsky-surface-hover: #f8f9fb;
  --bsky-border: #e5e7eb;
  --bsky-text: #101828;
  --bsky-muted: #6b7280;
  --bsky-faint: #9ca3af;
  --bsky-blue: #1185fe;
  --bsky-blue-hover: #0a6fd4;

  max-width: 600px;
  background: var(--bsky-surface);
  border: 1px solid var(--bsky-border);
  border-radius: 16px;
  font-family: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
  font-size: 15px;
  color: var(--bsky-text);
}

@media (prefers-color-scheme: dark) {
  .bsky-card {
    --bsky-surface: #151d28;
    --bsky-surface-hover: #1c2736;
    --bsky-border: #2c3a4e;
    --bsky-text: #ffffff;
    --bsky-muted: #abb8c9;
    --bsky-faint: #6f839f;
  }
}
:global(.v-theme--dark) .bsky-card {
  --bsky-surface: #151d28;
  --bsky-surface-hover: #1c2736;
  --bsky-border: #2c3a4e;
  --bsky-text: #ffffff;
  --bsky-muted: #abb8c9;
  --bsky-faint: #6f839f;
}

.bsky-px-4 { padding-left: 16px; padding-right: 16px; }
.bsky-pt-4 { padding-top: 16px; }
.bsky-pt-1 { padding-top: 4px; }
.bsky-pb-3 { padding-bottom: 12px; }
.bsky-pb-2 { padding-bottom: 8px; }
.bsky-p-4 { padding: 16px; }
.bsky-mt-3 { margin-top: 12px; }
.bsky-gap-3 { gap: 12px; }
.bsky-gap-8 { gap: 32px; }
.bsky-shrink-0 { flex: none; }
.bsky-min-w-0 { min-width: 0; }
.bsky-no-underline { text-decoration: none; }

.bsky-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--bsky-surface-hover);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.bsky-name {
  font-weight: 600;
  color: var(--bsky-text);
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bsky-handle {
  color: var(--bsky-muted);
  font-size: 13px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bsky-butterfly { margin-left: auto; flex: none; color: var(--bsky-blue); }
.bsky-butterfly:hover { color: var(--bsky-blue-hover); }

.bsky-richtext {
  color: var(--bsky-text);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 22px;
}
.bsky-richtext :deep(a) { color: var(--bsky-blue); text-decoration: none; }
.bsky-richtext :deep(a:hover) { text-decoration: underline; }

.bsky-media { border-radius: 12px; overflow: hidden; border: 1px solid var(--bsky-border); }
.bsky-media--grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
.bsky-media__img { width: 100%; object-fit: cover; display: block; }
.bsky-media__img--square { aspect-ratio: 1 / 1; }

.bsky-ext {
  display: block;
  border-radius: 12px;
  border: 1px solid var(--bsky-border);
  overflow: hidden;
  text-decoration: none;
  transition: background-color 0.15s ease;
}
.bsky-ext:hover { background: var(--bsky-surface-hover); }
.bsky-ext__thumb { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; }
.bsky-ext__body { padding: 8px 12px; }
.bsky-ext__title {
  font-weight: 600;
  color: var(--bsky-text);
  font-size: 15px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.bsky-ext__desc {
  color: var(--bsky-muted);
  font-size: 13px;
  line-height: 17px;
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.bsky-ext__host {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--bsky-faint);
}

.bsky-time { font-size: 13px; color: var(--bsky-muted); text-decoration: none; }
.bsky-time:hover { text-decoration: underline; }

.bsky-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-top: 1px solid var(--bsky-border);
  font-size: 15px;
}
.bsky-stat { color: var(--bsky-muted); text-decoration: none; }
.bsky-stat:hover { text-decoration: underline; }
.bsky-stat__count { font-weight: 600; color: var(--bsky-text); }

.bsky-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-top: 1px solid var(--bsky-border);
}
.bsky-action {
  color: var(--bsky-faint);
  background: none;
  border: 0;
  cursor: pointer;
  display: inline-flex;
  transition: color 0.15s ease;
}
.bsky-action:hover { color: var(--bsky-blue); }
.bsky-action--repost:hover { color: #22c55e; }
.bsky-action--like:hover { color: #ec4899; }

.bsky-skeleton { animation: bsky-pulse 1.6s ease-in-out infinite; }
.bsky-skel-lines { display: flex; flex-direction: column; gap: 8px; flex: 1; padding: 4px 0; }
.bsky-skel-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--bsky-border); flex: none; }
.bsky-skel-line { height: 16px; background: var(--bsky-border); border-radius: 4px; }
.bsky-skel-line--sm { height: 12px; }

.bsky-error { text-align: center; color: var(--bsky-muted); }
.bsky-error__icon { display: block; margin: 0 auto 8px; opacity: 0.3; }

@keyframes bsky-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@media (prefers-reduced-motion: reduce) {
  .bsky-skeleton { animation: none; }
}
</style>
