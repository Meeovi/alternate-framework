<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
	createMediaEngine,
	createMediaAnalytics,
	type MediaAnalyticsReporter,
	type MediaEngineFactoryOptions,
	type MediaPlayer,
	type MediaSource
} from '../../index'

const props = withDefaults(
	defineProps<{
		source: MediaSource | string
		poster?: string
		autoplay?: boolean
		controls?: boolean
		muted?: boolean
		loop?: boolean
		preload?: 'auto' | 'metadata' | 'none'
		className?: string
		analyticsReporter?: MediaAnalyticsReporter
		player?: MediaEngineFactoryOptions['player']
	}>(),
	{
		controls: true,
		autoplay: false,
		muted: false,
		loop: false,
		preload: 'metadata',
		className: 'alt-media-player',
		player: 'videojs'
	}
)

const emit = defineEmits<{
	ready: [player: MediaPlayer]
	play: []
	pause: []
	ended: []
	error: [error: unknown]
	timeupdate: [currentTime: number | undefined]
	disposed: []
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
let player: MediaPlayer | null = null
let analyticsCleanup: (() => void) | null = null

const createPlayer = () => {
	if (!videoRef.value) {
		return
	}

	player = createMediaEngine({ player: props.player }).mount(videoRef.value)
	player.loadSource(props.source)
	player.setMuted?.(props.muted)

	player.on('play', () => emit('play'))
	player.on('pause', () => emit('pause'))
	player.on('ended', () => emit('ended'))
	player.on('error', (error) => emit('error', error))
	player.on('timeupdate', () => emit('timeupdate', player?.getCurrentTime?.()))

	if (props.analyticsReporter) {
		const subscription = createMediaAnalytics(player, props.analyticsReporter)
		analyticsCleanup = () => subscription.dispose()
	}

	emit('ready', player)
}

const destroyPlayer = () => {
	analyticsCleanup?.()
	analyticsCleanup = null
	player?.dispose()
	player = null
	emit('disposed')
}

onMounted(createPlayer)
onBeforeUnmount(destroyPlayer)

watch(
	() => props.source,
	(nextSource) => {
		player?.loadSource(nextSource)
	}
)

watch(
	() => props.muted,
	(isMuted) => {
		player?.setMuted?.(isMuted)
	}
)
</script>

<template>
	<video
		ref="videoRef"
		:class="className"
		:poster="poster"
		:autoplay="autoplay"
		:controls="controls"
		:muted="muted"
		:loop="loop"
		:preload="preload"
		playsinline
	/>
</template>

