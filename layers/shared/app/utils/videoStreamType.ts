// Detects adaptive-streaming format from a video URL's extension so
// AdaptivePlayer.vue can pick the right <video type="..."> MIME hint.
export type VideoStreamType = 'hls' | 'dash' | 'progressive'

export function detectVideoStreamType(src: string | undefined | null): VideoStreamType {
	if (!src) return 'progressive'
	if (/\.m3u8(\?.*)?$/i.test(src)) return 'hls'
	if (/\.mpd(\?.*)?$/i.test(src)) return 'dash'
	return 'progressive'
}
