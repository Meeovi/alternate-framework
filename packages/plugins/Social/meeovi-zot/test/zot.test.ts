import { describe, expect, it } from 'vitest'
import { bbcodeImages, bbcodeToHtml, bbcodeToText } from '../runtime/bbcode'
import { asPost, channelActor, createZotMemberSession, createZotNetwork, decodeMid, encodeMid, itemPost } from '../runtime/network'
import { ZotApi, normalizeHub, type ZotItem } from '../runtime/api'

const AUTHOR = { name: 'Alice', address: 'alice@hub.example', url: 'https://hub.example/channel/alice', photo: { src: 'https://hub.example/photo/profile/m/1' } }
const item = (over: Partial<ZotItem> = {}): ZotItem => ({
  message_id: 'https://hub.example/item/1b2c',
  message_top: 'https://hub.example/item/1b2c',
  created: '2026-11-07 01:02:03',
  title: '',
  body: 'Look [b]here[/b] [url=https://meeovi.com]Meeovi[/url] #garden\n[img]https://hub.example/photo/a.jpg[/img]',
  verb: 'Create',
  permalink: 'https://hub.example/item/1b2c',
  author: AUTHOR,
  ...over,
})

describe('BBCode', () => {
  it('becomes safe HTML and plain text', () => {
    const html = bbcodeToHtml('<script>x</script>[b]bold[/b] [url=javascript:alert(1)]bad[/url] [url]https://a.example[/url]\n[list][*]one[*]two[/list]')
    expect(html).not.toContain('<script')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('<b>bold</b>')
    expect(html).toContain('<a href="#">bad</a>')
    expect(html).toContain('<a href="https://a.example">https://a.example</a>')
    expect(html).toContain('<ul><li>one</li><li>two</li></ul>')
    expect(bbcodeToText('[b]Hi[/b] [url=https://x.example]there[/url][img]https://x/a.png[/img]')).toBe('Hi there')
    expect(bbcodeImages('[zmg]https://hub.example/p.jpg[/zmg][img]http://insecure/x.png[/img]')).toEqual(['https://hub.example/p.jpg'])
  })

  it('keeps code blocks as they are', () => {
    expect(bbcodeToHtml('[code][b]not bold[/b][/code]')).toBe('<pre><code>[b]not bold[/b]</code></pre>')
  })
})

describe('Zot items and channels', () => {
  it('puts message ids in addresses and reads them back (https only)', () => {
    const key = encodeMid('https://hub.example/item/1b2c')
    expect(key).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeMid(key)).toBe('https://hub.example/item/1b2c')
    expect(decodeMid(encodeMid('http://hub.example/item/1'))).toBeNull()
    expect(decodeMid('bad key!')).toBeNull()
  })

  it('maps an api/z/1.0 item to a note', () => {
    const post = itemPost(item())
    expect(post.network).toBe('zot')
    expect(post.author.handle).toBe('alice@hub.example')
    expect(post.createdAt).toBe('2026-11-07T01:02:03.000Z')
    expect(post.text).toContain('Look here Meeovi #garden')
    expect(post.html).toContain('<a href="https://meeovi.com">Meeovi</a>')
    expect(post.media).toEqual([{ url: 'https://hub.example/photo/a.jpg', type: 'image' }])
    expect(post.hashtags).toEqual(['garden'])
  })

  it("shows only posts in a member's stream (not comments, likes or deleted items)", async () => {
    const api = new ZotApi({ hub: 'https://hub.example', channel: 'alice', password: 'x' })
    ;(api as any).networkStream = async () => [
      item(),
      item({ message_id: 'https://hub.example/item/c1', message_top: 'https://hub.example/item/1b2c' }),
      item({ message_id: 'https://hub.example/item/l1', verb: 'Like' }),
      item({ message_id: 'https://hub.example/item/d1', message_top: 'https://hub.example/item/d1', item_deleted: 1 }),
    ]
    const session = createZotMemberSession(api, channelActor({ channel_address: 'alice', channel_name: 'Alice' }, 'hub.example'))
    const timeline = await session.timeline!({ limit: 10 })
    expect(timeline.map((p) => decodeMid(p.id))).toEqual(['https://hub.example/item/1b2c'])
    expect(session.account.handle).toBe('alice@hub.example')
  })

  it('posts replies to the parent message', async () => {
    const sent: unknown[] = []
    const api = new ZotApi({ hub: 'https://hub.example', channel: 'alice', password: 'x' })
    ;(api as any).post = async (body: string, parent?: string) => { sent.push([body, parent]); return { success: true, item: { mid: 'https://hub.example/item/new', body, created: '2026-11-07 03:00:00' } } }
    const session = createZotMemberSession(api, channelActor({ channel_address: 'alice' }, 'hub.example'))
    const post = await session.publish!({ text: 'Thanks!', replyTo: encodeMid('https://hub.example/item/1b2c') })
    expect(sent).toEqual([['Thanks!', 'https://hub.example/item/1b2c']])
    expect(decodeMid(post.id)).toBe('https://hub.example/item/new')
    await expect(session.publish!({ text: 'x', replyTo: 'nope!' })).rejects.toMatchObject({ statusCode: 400 })
  })

  it('reads public ActivityStreams posts and skips sensitive ones', () => {
    const actor = channelActor({ channel_address: 'alice' }, 'hub.example')
    const note = { id: 'https://hub.example/item/9', type: 'Note', content: '<p>Hi &amp; bye</p>', published: '2026-11-07T00:00:00Z', to: ['https://www.w3.org/ns/activitystreams#Public'] }
    expect(asPost(note, actor)).toMatchObject({ text: 'Hi & bye', id: encodeMid('https://hub.example/item/9') })
    expect(asPost({ ...note, sensitive: true }, actor)).toBeNull()
  })

  it('checks connect details before going anywhere', async () => {
    const connect = createZotNetwork().connection!.connect!
    await expect(connect({ hub: 'http://hub.example', channel: 'alice', password: 'x' })).rejects.toThrow('https')
    await expect(connect({ hub: 'https://hub.example', channel: 'alice smith', password: 'x' })).rejects.toThrow('nickname')
    expect(normalizeHub('hub.example/')).toBe('https://hub.example')
  })
})
