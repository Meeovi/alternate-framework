import type { MediaSource } from '../../createMediaEngine'

export const HLS_MIME_TYPE = 'application/x-mpegURL'

export const isHlsSource = (source: MediaSource | string): boolean => {
	if (typeof source === 'string') {
		return source.endsWith('.m3u8')
	}

	return source.type === HLS_MIME_TYPE || source.src.endsWith('.m3u8')
}

export const createHlsSource = (src: string): MediaSource => ({
	src,
	type: HLS_MIME_TYPE
})

