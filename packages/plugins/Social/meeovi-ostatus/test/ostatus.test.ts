import { describe, expect, it } from 'vitest'
import { parseAtom } from '../runtime/atom'
import { apiActor, apiPost, atomActor, atomPost, createOstatusMemberSession, createOstatusNetwork, parseScopedId, scopedId } from '../runtime/network'
import { GnuSocialApi, normalizeServer } from '../runtime/api'
import { assertSafeUrl, isPrivateAddress } from '../runtime/safe-fetch'
import { parseHandle } from '../runtime/webfinger'

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:thr="http://purl.org/syndication/thread/1.0"
  xmlns:activity="http://activitystrea.ms/spec/1.0/" xmlns:poco="http://portablecontacts.net/spec/1.0">
  <title>alice timeline</title>
  <author>
    <activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type>
    <uri>https://gnusocial.example/user/7</uri>
    <name>alice</name>
    <link rel="alternate" type="text/html" href="https://gnusocial.example/alice"/>
    <link rel="avatar" type="image/png" media:width="96" href="https://gnusocial.example/avatar/7-96.png"/>
    <poco:preferredUsername>alice</poco:preferredUsername>
    <poco:displayName>Alice &amp; Co</poco:displayName>
    <poco:note>Gardener</poco:note>
  </author>
  <entry>
    <id>tag:gnusocial.example,2026-11-07:noticeId=1234:objectType=note</id>
    <title>New note by alice</title>
    <content type="html">Hello &lt;b&gt;world&lt;/b&gt; #garden</content>
    <link rel="alternate" type="text/html" href="https://gnusocial.example/notice/1234"/>
    <activity:verb>http://activitystrea.ms/schema/1.0/post</activity:verb>
    <activity:object-type>http://activitystrea.ms/schema/1.0/note</activity:object-type>
    <published>2026-11-07T01:00:00+00:00</published>
    <link rel="enclosure" type="image/jpeg" href="https://gnusocial.example/file/a.jpg"/>
    <category term="garden"/>
  </entry>
  <entry>
    <id>tag:gnusocial.example,2026-11-07:fave:7:note:99</id>
    <title>Favorite</title>
    <content type="html">alice favorited something</content>
    <activity:verb>http://activitystrea.ms/schema/1.0/favorite</activity:verb>
    <published>2026-11-07T00:00:00+00:00</published>
  </entry>
</feed>`

const USER = { id: 7, screen_name: 'alice', name: 'Alice', statusnet_profile_url: 'https://gnusocial.example/alice', profile_image_url_https: 'https://gnusocial.example/avatar/7.png', followers_count: 3, friends_count: 4, statuses_count: 5 }

describe('Atom (OStatus) feeds', () => {
  it('reads the author, posts and their media', () => {
    const feed = parseAtom(FEED)
    expect(feed.author?.displayName).toBe('Alice & Co')
    expect(feed.author?.avatar).toBe('https://gnusocial.example/avatar/7-96.png')
    expect(feed.entries).toHaveLength(2)
    const [note, fave] = feed.entries
    expect(note!.verb).toBe('post')
    expect(fave!.verb).toBe('favorite')
    const actor = atomActor(feed.author, 'alice@gnusocial.example')
    const post = atomPost(note!, actor)
    expect(post.id).toBe('gnusocial.example~1234')
    expect(post.text).toBe('Hello world #garden')
    expect(post.html).toContain('<b>world</b>')
    expect(post.url).toBe('https://gnusocial.example/notice/1234')
    expect(post.media).toEqual([{ url: 'https://gnusocial.example/file/a.jpg', type: 'image' }])
    expect(post.hashtags).toEqual(['garden'])
  })

  it('refuses things that are not Atom', () => {
    expect(() => parseAtom('<html><body>nope</body></html>')).toThrow('Not an Atom feed')
  })
})

describe('the GNU social API', () => {
  it('scopes ids to the server that issued them', () => {
    expect(scopedId('gnusocial.example', 42)).toBe('gnusocial.example~42')
    expect(parseScopedId('gnusocial.example~42')).toEqual({ host: 'gnusocial.example', id: '42' })
    for (const bad of ['42', 'gnusocial.example~', '~42', 'localhost~1', 'a.example~../x']) expect(parseScopedId(bad)).toBeNull()
  })

  it('maps accounts and statuses, showing a repeat as the repeated post', () => {
    expect(apiActor(USER, 'gnusocial.example')).toMatchObject({ id: 'gnusocial.example~7', handle: 'alice@gnusocial.example', followers: 3 })
    // A remote account seen from the member's server keeps its own domain.
    expect(apiActor({ ...USER, statusnet_profile_url: 'https://other.example/bob', screen_name: 'bob' }, 'gnusocial.example').handle).toBe('bob@other.example')
    const original = { id: 9, created_at: 'Sat Nov 07 01:00:00 +0000 2026', statusnet_html: 'Hi <a href="https://x">#tag</a>', text: 'Hi #tag', user: USER, fave_num: 2, repeat_num: 1, external_url: 'https://gnusocial.example/notice/9' }
    const repeat = { id: 10, created_at: 'Sat Nov 07 02:00:00 +0000 2026', text: 'RT', user: { ...USER, id: 8, screen_name: 'carol' }, retweeted_status: original }
    const post = apiPost(repeat as any, 'gnusocial.example')
    expect(post).toMatchObject({ id: 'gnusocial.example~9', text: 'Hi #tag', likes: 2, reposts: 1, url: 'https://gnusocial.example/notice/9', hashtags: ['tag'] })
    expect(post.createdAt).toBe('2026-11-07T01:00:00.000Z')
  })

  it("acts only on posts from the member's own server", async () => {
    const calls: string[] = []
    const api = GnuSocialApi.forMember({ server: 'https://gnusocial.example', username: 'alice', password: 'x' })
    ;(api as any).post = async (path: string) => { calls.push(path); return {} }
    const session = createOstatusMemberSession(api, apiActor(USER, 'gnusocial.example'))
    await session.like!('gnusocial.example~9')
    await session.repost!('gnusocial.example~9')
    await session.follow!('gnusocial.example~8')
    expect(calls).toEqual(['favorites/create/9.json', 'statuses/retweet/9.json', 'friendships/create.json'])
    await expect(session.like!('other.example~9')).rejects.toMatchObject({ statusCode: 409 })
    await expect(session.unpublish!('not-an-id')).rejects.toMatchObject({ statusCode: 400 })
  })

  it('checks connect details before going anywhere', async () => {
    const connect = createOstatusNetwork().connection!.connect!
    await expect(connect({ server: 'http://gnusocial.example', username: 'alice', password: 'x' })).rejects.toThrow('https')
    await expect(connect({ server: 'https://127.0.0.1', username: 'alice', password: 'x' })).rejects.toThrow('not reachable')
    await expect(connect({ server: 'https://gnusocial.example', username: 'bad name!', password: 'x' })).rejects.toThrow('username')
    expect(normalizeServer('gnusocial.example/index.php/')).toBe('https://gnusocial.example')
  })
})

describe('safe fetching', () => {
  it('only allows public https servers on the standard port', () => {
    expect(assertSafeUrl('https://gnusocial.example/api').host).toBe('gnusocial.example')
    for (const bad of ['http://gnusocial.example', 'https://gnusocial.example:6379', 'https://localhost', 'https://10.0.0.5', 'https://[::1]', 'https://router.lan', 'https://u:p@gnusocial.example', 'file:///etc/passwd']) {
      expect(() => assertSafeUrl(bad), bad).toThrow()
    }
  })

  it('knows private and reserved addresses', () => {
    for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.1.1', '169.254.169.254', '100.64.0.1', '::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1', '0.0.0.0']) expect(isPrivateAddress(ip), ip).toBe(true)
    for (const ip of ['158.69.211.52', '1.1.1.1', '2606:4700::1111']) expect(isPrivateAddress(ip), ip).toBe(false)
  })

  it('parses handles', () => {
    expect(parseHandle('@alice@GNUsocial.example')).toEqual({ user: 'alice', domain: 'gnusocial.example' })
    expect(parseHandle('acct:alice@gnusocial.example')).toEqual({ user: 'alice', domain: 'gnusocial.example' })
    expect(parseHandle('alice')).toBeNull()
  })
})
