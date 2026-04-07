# @mframework/alternate-media

Framework-agnostic media engine with:

- engine factory (`createMediaEngine`)
- Video.js wrapper (`players/videojs`)
- Vue adapter component (`adapters/vue`)
- analytics hooks (`analytics`)

## Install

```bash
npm i @mframework/alternate-media video.js
```

## Factory

```ts
import { createMediaEngine } from '@mframework/alternate-media'

const engine = createMediaEngine({ player: 'videojs' })
const player = engine.mount(document.querySelector('video') as HTMLVideoElement)
player.loadSource({ src: 'https://example.com/stream.m3u8', type: 'application/x-mpegURL' })
```

## Analytics

```ts
import { createMediaAnalytics } from '@mframework/alternate-media'

const subscription = createMediaAnalytics(player, (event) => {
	console.log('[media event]', event)
})

subscription.dispose()
```

## Vue Adapter

```vue
<script setup lang="ts">
import MediaPlayer from '@mframework/alternate-media/adapters/vue'

const source = {
	src: 'https://example.com/video.mp4',
	type: 'video/mp4'
}
</script>

<template>
	<MediaPlayer :source="source" />
</template>
```

