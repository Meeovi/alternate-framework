import { describe, expect, it } from 'vitest'
import { checkVideoLink, parseVideoLink } from '../runtime/server/providers'

describe('parseVideoLink', () => {
  it.each([
    ['https://www.youtube.com/watch?v=jNQXAC9IVRw&t=3', 'youtube', 'jNQXAC9IVRw', 'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw'],
    ['https://youtu.be/jNQXAC9IVRw', 'youtube', 'jNQXAC9IVRw', 'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw'],
    ['https://m.youtube.com/shorts/jNQXAC9IVRw', 'youtube', 'jNQXAC9IVRw', 'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw'],
    ['https://vimeo.com/76979871', 'vimeo', '76979871', 'https://player.vimeo.com/video/76979871'],
    ['https://vimeo.com/76979871/abcdef1234', 'vimeo', '76979871', 'https://player.vimeo.com/video/76979871?h=abcdef1234'],
    ['https://www.dailymotion.com/video/x8b2b8u', 'dailymotion', 'x8b2b8u', 'https://www.dailymotion.com/embed/video/x8b2b8u'],
    ['https://dai.ly/x8b2b8u', 'dailymotion', 'x8b2b8u', 'https://www.dailymotion.com/embed/video/x8b2b8u'],
    ['https://www.tiktok.com/@scout2015/video/6718335390845095173', 'tiktok', '6718335390845095173', 'https://www.tiktok.com/player/v1/6718335390845095173'],
    ['https://framatube.org/w/004fe864-ef4d-4a52-a907-8e57ec050f25', 'peertube', 'framatube.org/004fe864-ef4d-4a52-a907-8e57ec050f25', 'https://framatube.org/videos/embed/004fe864-ef4d-4a52-a907-8e57ec050f25'],
  ])('%s', (input, provider, id, embedUrl) => {
    expect(parseVideoLink(input)).toMatchObject({ provider, id, embedUrl })
  })

  it.each(['https://example.com/video.mp4', 'https://www.youtube.com/watch?v=short', 'https://www.twitch.tv/videos/123', 'javascript:alert(1)', 'not a link', 'http://framatube.org/w/004fe864-ef4d'])(
    'rejects %s', (input) => expect(parseVideoLink(input)).toBeNull())
})

const answers = (map: Record<string, unknown>) => async (url: string) => {
  const key = Object.keys(map).find((k) => url.startsWith(k))
  if (!key) throw Object.assign(new Error('not found'), { status: 404 })
  const value = map[key]
  if (value instanceof Error) throw value
  return value as any
}

describe('checkVideoLink', () => {
  it('returns the link and the platform details for an ordinary video', async () => {
    const res = await checkVideoLink('https://youtu.be/jNQXAC9IVRw', {
      fetchJson: answers({ 'https://www.youtube.com/oembed': { title: 'Me at the zoo', author_name: 'jawed', thumbnail_url: 'https://i.ytimg.com/vi/x/hqdefault.jpg' } }),
    })
    expect(res.link.url).toBe('https://www.youtube.com/watch?v=jNQXAC9IVRw')
    expect(res.meta).toMatchObject({ title: 'Me at the zoo', author: 'jawed' })
  })

  it('refuses adult hosts and addresses before asking anyone', async () => {
    const never = async () => { throw new Error('should not fetch') }
    await expect(checkVideoLink('https://www.pornhub.com/view_video.php?viewkey=1', { fetchJson: never })).rejects.toMatchObject({ code: 'adult', statusCode: 422 })
    await expect(checkVideoLink('https://videos.example.xxx/w/abcdefgh', { fetchJson: never })).rejects.toMatchObject({ code: 'adult' })
  })

  it('refuses unsupported sites', async () => {
    await expect(checkVideoLink('https://example.com/clip')).rejects.toMatchObject({ code: 'unsupported', statusCode: 400 })
  })

  it('refuses adult titles, channels, descriptions and tags, and the member\'s own words', async () => {
    const yt = (title: string, author = 'someone') => answers({ 'https://www.youtube.com/oembed': { title, author_name: author } })
    await expect(checkVideoLink('https://youtu.be/jNQXAC9IVRw', { fetchJson: yt('Hot n.s.f.w clip') })).rejects.toMatchObject({ code: 'adult' })
    await expect(checkVideoLink('https://youtu.be/jNQXAC9IVRw', { fetchJson: yt('Clip', 'xxx channel') })).rejects.toMatchObject({ code: 'adult' })
    await expect(checkVideoLink('https://dai.ly/x8b2b8u', { fetchJson: answers({ 'https://api.dailymotion.com/video/': { title: 'Clip', tags: ['onlyfans'], status: 'published' } }) })).rejects.toMatchObject({ code: 'adult' })
    await expect(checkVideoLink('https://youtu.be/jNQXAC9IVRw', { fetchJson: yt('Clip'), memberText: ['my sex tape'] })).rejects.toMatchObject({ code: 'adult' })
  })

  it('honours the platforms\' own adult flags', async () => {
    await expect(checkVideoLink('https://dai.ly/x8b2b8u', { fetchJson: answers({ 'https://api.dailymotion.com/video/': { title: 'Clip', explicit: true, status: 'published' } }) })).rejects.toMatchObject({ code: 'adult' })
    const pt = (video: object, instance: object = {}) => answers({
      'https://framatube.org/api/v1/config': { serverVersion: '7.0.0', instance: { name: 'x', ...instance } },
      'https://framatube.org/api/v1/videos/': { name: 'Clip', nsfw: false, privacy: { id: 1 }, ...video },
    })
    const link = 'https://framatube.org/w/004fe864-ef4d-4a52-a907-8e57ec050f25'
    await expect(checkVideoLink(link, { fetchJson: pt({ nsfw: true }) })).rejects.toMatchObject({ code: 'adult' })
    await expect(checkVideoLink(link, { fetchJson: pt({}, { isNSFW: true }) })).rejects.toMatchObject({ code: 'adult' })
    await expect(checkVideoLink(link, { fetchJson: pt({ nsfw: undefined }) })).rejects.toMatchObject({ code: 'adult' })
    await expect(checkVideoLink(link, { fetchJson: pt({}) })).resolves.toMatchObject({ meta: { title: 'Clip' } })
    await expect(checkVideoLink(link, { fetchJson: pt({ privacy: { id: 3 } }) })).rejects.toMatchObject({ code: 'unavailable' })
    await expect(checkVideoLink('https://youtu.be/jNQXAC9IVRw', {
      youtubeApiKey: 'k',
      fetchJson: answers({ 'https://www.googleapis.com/youtube/v3/videos': { items: [{ snippet: { title: 'Clip' }, contentDetails: { contentRating: { ytRating: 'ytAgeRestricted' } }, status: { embeddable: true } }] } }),
    })).rejects.toMatchObject({ code: 'adult' })
  })

  it('refuses videos that are gone, private or not embeddable', async () => {
    await expect(checkVideoLink('https://youtu.be/jNQXAC9IVRw', { fetchJson: answers({ 'https://www.youtube.com/oembed': Object.assign(new Error('x'), { status: 401 }) }) })).rejects.toMatchObject({ code: 'unavailable' })
    await expect(checkVideoLink('https://vimeo.com/1', { fetchJson: answers({}) })).rejects.toMatchObject({ code: 'unavailable' })
    await expect(checkVideoLink('https://dai.ly/x8b2b8u', { fetchJson: answers({ 'https://api.dailymotion.com/video/': { title: 'Clip', private: true } }) })).rejects.toMatchObject({ code: 'unavailable' })
  })

  it('reports a platform that does not answer as a temporary failure', async () => {
    await expect(checkVideoLink('https://vimeo.com/1', { fetchJson: answers({ 'https://vimeo.com/api/oembed.json': Object.assign(new Error('x'), { status: 500 }) }) })).rejects.toMatchObject({ code: 'upstream', statusCode: 502 })
  })
})
