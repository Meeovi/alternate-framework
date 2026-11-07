<template>
  <v-chip v-if="source.status.value === 'p2p' || source.status.value === 'starting'" size="small" variant="tonal"
    color="primary" prepend-icon="fas fa-share-nodes" :title="title">
    {{ source.status.value === 'starting' ? 'P2P…' : `P2P · ${source.peers.value} ${source.peers.value === 1 ? 'peer' : 'peers'}` }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { WebTorrentSource } from '../composables/useWebTorrentSource'

/** Shows when a video is playing peer-to-peer (useWebTorrentSource), with its peer count. */
// Runtime prop: the SFC compiler can't resolve the composable's ReturnType across files.
const props = defineProps({ source: { type: Object as PropType<WebTorrentSource>, required: true } })
const title = computed(() => props.source.status.value === 'p2p'
  ? 'Streaming peer-to-peer with WebTorrent: you are also sharing this video while it plays.'
  : 'Starting peer-to-peer playback…')
</script>
