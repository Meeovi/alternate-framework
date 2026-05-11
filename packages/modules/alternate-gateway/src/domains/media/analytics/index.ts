import type { MediaPlayer } from '../createMediaEngine'

export interface MediaAnalyticsEvent {
	event: string
	currentTime?: number
	timestamp: number
	metadata?: Record<string, unknown>
}

export type MediaAnalyticsReporter = (event: MediaAnalyticsEvent) => void

export interface MediaAnalyticsOptions {
	metadata?: Record<string, unknown>
	throttleMs?: number
}

export interface MediaAnalyticsSubscription {
	dispose: () => void
}

export const createMediaAnalytics = (
	player: MediaPlayer,
	reporter: MediaAnalyticsReporter,
	options: MediaAnalyticsOptions = {}
): MediaAnalyticsSubscription => {
	const { metadata, throttleMs = 5000 } = options
	const subscriptions: Array<{ event: string; handler: () => void }> = []
	let lastTimeUpdate = 0

	const publish = (event: string): void => {
		reporter({
			event,
			timestamp: Date.now(),
			currentTime: player.getCurrentTime?.(),
			metadata
		})
	}

	const events = ['play', 'pause', 'ended', 'error', 'seeking', 'seeked']

	for (const event of events) {
		const handler = () => publish(event)
		player.on(event, handler)
		subscriptions.push({ event, handler })
	}

	const timeUpdateHandler = () => {
		const now = Date.now()
		if (now - lastTimeUpdate < throttleMs) {
			return
		}

		lastTimeUpdate = now
		publish('timeupdate')
	}

	player.on('timeupdate', timeUpdateHandler)
	subscriptions.push({ event: 'timeupdate', handler: timeUpdateHandler })

	return {
		dispose: () => {
			for (const subscription of subscriptions) {
				player.off(subscription.event, subscription.handler)
			}
		}
	}
}

