/// <reference path="../../types/videojs-plugins.d.ts" />

import type videojs from 'video.js'

let pluginsRegistered = false

export interface VideojsPluginConfig {
	enableQualitySelector?: boolean
	enablePersist?: boolean
	enableShare?: boolean
}

export const registerVideojsPlugins = async (
	_videojs: typeof videojs,
	config: VideojsPluginConfig = {}
): Promise<void> => {
	if (pluginsRegistered) {
		return
	}

	const {
		enableQualitySelector = true,
		enablePersist = true,
		enableShare = false
	} = config

	if (enableQualitySelector) {
		await Promise.allSettled([
			import('videojs-contrib-quality-levels'),
			import('videojs-hls-quality-selector')
		])
	}

	if (enablePersist) {
		await Promise.allSettled([import('videojs-persist')])
	}

	if (enableShare) {
		await Promise.allSettled([import('videojs-share')])
	}

	pluginsRegistered = true
}

