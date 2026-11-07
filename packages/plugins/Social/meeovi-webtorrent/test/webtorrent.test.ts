import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import bencode from 'bencode'
import { allowedSource, buildTorrentFile, sniffMedia, sourceId } from '../runtime/server/media'

const HOSTS = ['app.pixanomy.com']

// A minimal MP4 header (ftyp box) followed by filler.
const mp4 = () => Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypisom'), Buffer.alloc(200_000, 7)])

describe('which videos can be shared', () => {
  it('only https videos on the allowed hosts', () => {
    expect(allowedSource('https://app.pixanomy.com/index.php/s/abc/download', HOSTS)?.host).toBe('app.pixanomy.com')
    for (const bad of [
      'http://app.pixanomy.com/s/abc', 'https://app.pixanomy.com:8443/s/abc', 'https://evil.example/s/abc',
      'https://app.pixanomy.com.evil.example/x', 'https://user:pw@app.pixanomy.com/x', 'not a url', null,
    ]) expect(allowedSource(bad, HOSTS), String(bad)).toBeNull()
  })

  it('gives each video a stable short id', () => {
    const a = sourceId('https://app.pixanomy.com/s/abc/download')
    expect(a).toMatch(/^[0-9a-f]{32}$/)
    expect(sourceId('https://app.pixanomy.com/s/abc/download')).toBe(a)
    expect(sourceId('https://app.pixanomy.com/s/abd/download')).not.toBe(a)
  })

  it('recognises media from its first bytes', () => {
    expect(sniffMedia(mp4())).toBe('video/mp4')
    expect(sniffMedia(Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0]))).toBe('video/webm')
    expect(sniffMedia(Buffer.from('OggS....'))).toBe('audio/ogg')
    expect(sniffMedia(Buffer.from('ID3....'))).toBe('audio/mpeg')
    expect(sniffMedia(Buffer.from('<html>'))).toBeNull()
  })
})

describe('torrents', () => {
  it('have the web seed and trackers, and the same info hash every time', async () => {
    const options = { id: 'a'.repeat(32), type: 'video/mp4', siteUrl: 'https://meeovi.com', trackers: ['wss://tracker.openwebtorrent.com', 'wss://tracker.webtorrent.dev'] }
    const first = await buildTorrentFile(mp4(), options)
    const second = await buildTorrentFile(mp4(), options)
    const t: any = bencode.decode(first)
    const text = (v: Uint8Array) => Buffer.from(v).toString('utf8')
    expect(text(t.info.name)).toBe(`${'a'.repeat(32)}.mp4`)
    expect(t['url-list'].map(text)).toEqual([`https://meeovi.com/api/webtorrent/seed/${'a'.repeat(32)}`])
    expect(t['announce-list'].map((tier: Uint8Array[]) => tier.map(text))).toEqual([['wss://tracker.openwebtorrent.com'], ['wss://tracker.webtorrent.dev']])
    const hash = (buf: Buffer) => createHash('sha1').update(bencode.encode((bencode.decode(buf) as any).info)).digest('hex')
    expect(hash(first)).toBe(hash(second))
  })
})
