import { describe, expect, it, vi } from 'vitest'
import { createAtprotoMemberSession } from '../runtime/member'
import type { AtprotoClient } from '../runtime/client'

const post = (uri: string, extra: Record<string, unknown> = {}) => ({
  uri, cid: `cid-${uri}`, text: 'hi', createdAt: '2026-10-29T10:00:00Z', authorDid: 'did:plc:bob', authorHandle: 'bob.test', visibility: 'public', ...extra,
})

function fakeClient(over: Record<string, unknown> = {}) {
  return {
    did: 'did:plc:me',
    handle: 'me.test',
    getPost: vi.fn(async (uri: string) => post(uri)),
    like: vi.fn(async () => ({ likeUri: 'at://did:plc:me/app.bsky.feed.like/1' })),
    unlike: vi.fn(async () => {}),
    repost: vi.fn(async () => ({ repostUri: 'r' })),
    unrepost: vi.fn(async () => {}),
    getProfile: vi.fn(async (actor: string) => ({ did: `did:plc:${actor}`, handle: actor })),
    follow: vi.fn(async () => ({ followUri: 'f' })),
    unfollow: vi.fn(async () => {}),
    createPost: vi.fn(async (opts: any) => post('at://did:plc:me/app.bsky.feed.post/new', { text: opts.text, authorDid: 'did:plc:me', authorHandle: 'me.test' })),
    getTimeline: vi.fn(async () => ({ posts: [post('at://x/app.bsky.feed.post/1')] })),
    getLists: vi.fn(async () => ({ lists: [
      { uri: 'at://did:plc:me/app.bsky.graph.list/a', cid: 'c', name: 'Friends', purpose: 'app.bsky.graph.defs#curatelist' },
      { uri: 'at://did:plc:me/app.bsky.graph.list/b', cid: 'c', name: 'Blocked', purpose: 'app.bsky.graph.defs#modlist' },
    ] })),
    addListItem: vi.fn(async () => ({ itemUri: 'at://did:plc:me/app.bsky.graph.listitem/1' })),
    ...over,
  } as unknown as AtprotoClient
}

describe('Bluesky member session', () => {
  it('is the member\'s own account', () => {
    expect(createAtprotoMemberSession(fakeClient()).account).toMatchObject({ id: 'did:plc:me', handle: 'me.test', network: 'atproto' })
  })

  it('likes once, and unlikes the member\'s own like record', async () => {
    const client = fakeClient()
    const session = createAtprotoMemberSession(client)
    await session.like!('at://bob/app.bsky.feed.post/1')
    expect(client.like).toHaveBeenCalledWith('at://bob/app.bsky.feed.post/1', 'cid-at://bob/app.bsky.feed.post/1')

    const liked = fakeClient({ getPost: vi.fn(async (uri: string) => post(uri, { viewer: { likeUri: 'at://did:plc:me/app.bsky.feed.like/9' } })) })
    const likedSession = createAtprotoMemberSession(liked)
    await likedSession.like!('at://bob/app.bsky.feed.post/1')
    expect(liked.like).not.toHaveBeenCalled()
    await likedSession.unlike!('at://bob/app.bsky.feed.post/1')
    expect(liked.unlike).toHaveBeenCalledWith('at://did:plc:me/app.bsky.feed.like/9')
  })

  it('follows by handle, and unfollows through the member\'s follow record', async () => {
    const client = fakeClient()
    await createAtprotoMemberSession(client).follow!('alice.test')
    expect(client.follow).toHaveBeenCalledWith('did:plc:alice.test')

    const following = fakeClient({ getProfile: vi.fn(async () => ({ did: 'did:plc:alice', handle: 'alice.test', viewer: { following: 'at://did:plc:me/app.bsky.graph.follow/3' } })) })
    await createAtprotoMemberSession(following).unfollow!('alice.test')
    expect(following.unfollow).toHaveBeenCalledWith('at://did:plc:me/app.bsky.graph.follow/3')
  })

  it('replies under the thread\'s root', async () => {
    const parentUri = 'at://bob/app.bsky.feed.post/child'
    const rootUri = 'at://bob/app.bsky.feed.post/root'
    const client = fakeClient({ getPost: vi.fn(async (uri: string) => post(uri, uri === parentUri ? { replyRootUri: rootUri } : {})) })
    const note = await createAtprotoMemberSession(client).publish!({ text: 'agreed', replyTo: parentUri })
    expect(client.createPost).toHaveBeenCalledWith({ text: 'agreed', replyParentUri: parentUri, replyParentCid: `cid-${parentUri}`, replyRootUri: rootUri, replyRootCid: `cid-${rootUri}` })
    expect(note).toMatchObject({ network: 'atproto', text: 'agreed', author: { handle: 'me.test' } })
  })

  it('shows the member\'s curated lists (not moderation lists), holding accounts', async () => {
    const lists = await createAtprotoMemberSession(fakeClient()).lists!()
    expect(lists).toEqual([expect.objectContaining({ id: 'at://did:plc:me/app.bsky.graph.list/a', name: 'Friends', kind: 'accounts', network: 'atproto' })])
  })

  it('adds accounts to a list, and nothing else', async () => {
    const client = fakeClient()
    const session = createAtprotoMemberSession(client)
    const item = await session.addToList!('at://did:plc:me/app.bsky.graph.list/a', { kind: 'account', actor: 'alice.test' })
    expect(client.addListItem).toHaveBeenCalledWith('at://did:plc:me/app.bsky.graph.list/a', 'did:plc:alice.test')
    expect(item).toMatchObject({ id: 'at://did:plc:me/app.bsky.graph.listitem/1', kind: 'account', actor: { handle: 'alice.test' } })
    await expect(session.addToList!('at://did:plc:me/app.bsky.graph.list/a', { kind: 'product', id: 7 })).rejects.toMatchObject({ statusCode: 400 })
  })
})
