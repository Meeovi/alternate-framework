import type { MediaSource } from '../createMediaEngine'
import { HLS_MIME_TYPE } from '../players/hls'

export const normalizeMediaSource = (source: MediaSource | string): MediaSource => {
	if (typeof source !== 'string') {
		return source
	}

	return {
		src: source,
		type: source.endsWith('.m3u8') ? HLS_MIME_TYPE : 'video/mp4'
	}
}

export const isBrowser = (): boolean => typeof window !== 'undefined'

