import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { sniffMedia } from '../../../shared/server/utils/mediaSniff'

// Tiny real files made with ffmpeg (test/fixtures/media). The recorded-*.webm
// ones were streamed, so like MediaRecorder output their sizes are unknown.
const fixture = (name: string) => new Uint8Array(readFileSync(fileURLToPath(new URL(`../fixtures/media/${name}`, import.meta.url))))

describe('sniffMedia', () => {
  it.each([
    ['audio.webm', 'audio/webm'],
    ['recorded-audio.webm', 'audio/webm'],
    ['audio.m4a', 'audio/mp4'],
    ['audio-in-mp4.mp4', 'audio/mp4'],
    ['audio.mp3', 'audio/mpeg'],
    ['audio.ogg', 'audio/ogg'],
    ['audio.wav', 'audio/wav'],
    ['audio.flac', 'audio/flac'],
    ['audio.aac', 'audio/aac'],
  ])('reads %s as audio only', (name, type) => {
    expect(sniffMedia(fixture(name))).toEqual({ type, hasVideo: false, hasAudio: true })
  })

  it.each([
    ['video.webm', 'video/webm', true],
    ['recorded-video.webm', 'video/webm', true],
    ['silent-video.webm', 'video/webm', false],
    ['video.mkv', 'video/x-matroska', true],
    ['video.mp4', 'video/mp4', true],
    ['faststart.mp4', 'video/mp4', true],
    ['video.mov', 'video/quicktime', true],
    ['video.ogv', 'video/ogg', false],
  ])('reads %s as video', (name, type, hasAudio) => {
    expect(sniffMedia(fixture(name))).toEqual({ type, hasVideo: true, hasAudio })
  })

  it('rejects things that aren’t audio or video', () => {
    expect(sniffMedia(new TextEncoder().encode('just some text pretending to be audio'))).toBeNull()
    expect(sniffMedia(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]))).toBeNull() // PNG
    expect(sniffMedia(fixture('audio.webm').subarray(0, 40))).toBeNull() // cut off before the track list
    expect(sniffMedia(new Uint8Array(4))).toBeNull()
  })
})
