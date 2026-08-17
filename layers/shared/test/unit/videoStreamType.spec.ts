import { describe, it, expect } from 'vitest'
import { detectVideoStreamType } from '../../app/utils/videoStreamType'

describe('detectVideoStreamType', () => {
  it('detects an HLS playlist by its .m3u8 extension', () => {
    expect(detectVideoStreamType('https://cdn.example.com/stream.m3u8')).toBe('hls')
  })

  it('detects a DASH manifest by its .mpd extension', () => {
    expect(detectVideoStreamType('https://cdn.example.com/stream.mpd')).toBe('dash')
  })

  it('still detects the extension when a query string follows it', () => {
    expect(detectVideoStreamType('https://cdn.example.com/stream.m3u8?token=abc')).toBe('hls')
    expect(detectVideoStreamType('https://cdn.example.com/stream.mpd?token=abc')).toBe('dash')
  })

  it('falls back to progressive for a plain video file', () => {
    expect(detectVideoStreamType('https://cdn.example.com/movie.mp4')).toBe('progressive')
  })

  it('falls back to progressive for a nullish or empty source', () => {
    expect(detectVideoStreamType(undefined)).toBe('progressive')
    expect(detectVideoStreamType(null)).toBe('progressive')
    expect(detectVideoStreamType('')).toBe('progressive')
  })

  it('is case-insensitive on the extension', () => {
    expect(detectVideoStreamType('https://cdn.example.com/stream.M3U8')).toBe('hls')
  })
})
