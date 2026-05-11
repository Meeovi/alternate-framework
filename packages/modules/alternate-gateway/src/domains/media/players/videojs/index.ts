import videojs from 'video.js'
import type { MediaEventHandler, MediaPlayer, MediaSource } from '../../createMediaEngine'
import type { VideojsPlayer } from '../../types/videojs-types'
import { normalizeMediaSource } from '../../utils'
import { registerVideojsPlugins, type VideojsPluginConfig } from './plugin'

export interface VideojsEngineOptions {
	playerOptions?: Record<string, unknown>
	plugins?: VideojsPluginConfig
}

const clampVolume = (value: number): number => {
	if (Number.isNaN(value)) {
		return 1
	}

	return Math.min(Math.max(value, 0), 1)
}

export const createVideojsPlayer = (
	element: HTMLVideoElement,
	options: VideojsEngineOptions = {}
): MediaPlayer => {
	void registerVideojsPlugins(videojs, options.plugins)

	const createPlayer = videojs as unknown as (
		id: Element | string,
		playerOptions?: Record<string, unknown>
	) => VideojsPlayer

	const player = createPlayer(element, {
		controls: true,
		preload: 'auto',
		fluid: true,
		...(options.playerOptions ?? {})
	})

	const wrappedHandlers = new Map<MediaEventHandler, (event?: unknown) => void>()

	return {
		loadSource: (source: MediaSource | string) => {
			player.src(normalizeMediaSource(source))
		},
		play: () => player.play(),
		pause: () => player.pause(),
		dispose: () => player.dispose(),
		on: (event, handler) => {
			const wrapped = (payload?: unknown) => handler(payload)
			wrappedHandlers.set(handler, wrapped)
			player.on(event, wrapped)
		},
		off: (event, handler) => {
			const wrapped = wrappedHandlers.get(handler)
			if (!wrapped) {
				return
			}
			player.off(event, wrapped)
			wrappedHandlers.delete(handler)
		},
		setMuted: (muted) => player.muted(muted),
		setVolume: (volume) => player.volume(clampVolume(volume)),
		getCurrentTime: () => player.currentTime()
	}
}

export type { VideojsPluginConfig } from './plugin'

