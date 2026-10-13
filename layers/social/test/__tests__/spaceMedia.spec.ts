import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Sign-in, Directus and Rocket.Chat are mocked: no logins or writes.
const state = vi.hoisted(() => ({
  user: null as Record<string, any> | null,
  spaces: {} as Record<string, any>,
  follows: [] as Array<{ follower_id: string, target_id: string }>,
  deleted: [] as string[],
  calls: [] as Array<{ path: string, options?: any }>,
  messages: {} as Record<string, any>,
  parts: [] as any[],
  removed: [] as Array<{ group: string, user: string }>,
}))

vi.mock('h3', async (importOriginal) => ({
  ...(await importOriginal<typeof import('h3')>()),
  readMultipartFormData: async () => state.parts,
}))

vi.mock('#auth/server/utils/sessions', () => ({
  requireAuth: async () => {
    if (!state.user) throw Object.assign(new Error('Unauthorized'), { statusCode: 401 })
    return state.user
  },
}))

vi.mock('@directus/sdk', () => {
  const client: any = { with: () => client, request: async (op: any) => op() }
  return {
    createDirectus: () => client,
    rest: () => ({}),
    staticToken: () => ({}),
    readItem: (_c: string, id: string) => async () => {
      if (!state.spaces[id]) throw new Error('not found')
      return state.spaces[id]
    },
    readItems: (_c: string, q: any) => async () =>
      state.follows.filter((f) => f.follower_id === q.filter.follower_id._eq && f.target_id === q.filter.target_id._eq),
  }
})

vi.mock('@mframework/meeovi-discussions/server', () => ({
  rcUsername: (u: { id: string }) => `meeovi-${u.id}`,
  ensureGroup: async (_e: any, name: string) => ({ _id: `room-${name}`, name }),
  ensureGroupMember: async () => {},
  deleteMessage: async (_e: any, _roomId: string, msgId: string) => { state.deleted.push(msgId) },
  removeGroupMember: async (_e: any, group: string, user: { id: string }) => {
    state.removed.push({ group, user: user.id })
    return true
  },
  asMember: async () => ({
    rcUser: { _id: 'rc-me' },
    url: 'https://chat.test',
    headers: {},
    call: async (path: string, options?: any) => {
      state.calls.push({ path, options })
      if (path === 'groups.history') return { messages: Object.values(state.messages) }
      if (path === 'chat.getMessage') return { message: state.messages[options.query.msgId] }
      if (path.startsWith('rooms.media/')) return { file: { _id: 'file-new' } }
      return {}
    },
  }),
}))

const media = await import('../../server/utils/spaceMedia')
const { default: list } = await import('../../server/api/social/spaces/[id]/media/index.get')
const { default: post } = await import('../../server/api/social/spaces/[id]/media/index.post')
const { default: remove } = await import('../../server/api/social/spaces/[id]/media/[msgId].delete')

const fixture = (name: string) => readFileSync(fileURLToPath(new URL(`../fixtures/media/${name}`, import.meta.url)))
const part = (name: string, type: string, data = fixture(name)) => ({ name: 'file', type, filename: name, data })

const event = (params: Record<string, string>, extra: Record<string, any> = {}) =>
  ({ context: { params }, node: { req: { headers: {} } }, ...extra }) as any

const audioSpace = {
  id: 3, name: 'Meeovi Talks',
  owner: { email: 'owner@meeovi.test' },
  members: [{ directus_users_id: { email: 'listed@meeovi.test' } }],
  space_type: [{ space_types_id: { name: 'Audio' } }],
}
const msg = (id: string, over: Record<string, any> = {}) => ({
  _id: id, rid: 'room-space-media-3', ts: '2026-10-12T10:00:00.000Z',
  u: { username: 'meeovi-alice', name: 'Alice' },
  files: [{ _id: `f-${id}`, name: `${id}.webm`, type: 'audio/webm' }],
  ...over,
})

beforeEach(() => {
  state.user = { id: 'alice', email: 'alice@meeovi.test', emailVerified: true, role: 'user' }
  state.spaces = {
    3: audioSpace,
    92: { ...audioSpace, id: 92, name: 'Soundcage', space_type: [{ space_types_id: { name: 'Video' } }] },
    1: { ...audioSpace, id: 1, name: 'Plain', space_type: [{ space_types_id: { name: 'Default' } }] },
  }
  state.follows = []
  state.deleted = []
  state.calls = []
  state.messages = {}
  state.removed = []
})

describe('who can use a space media discussion', () => {
  // Each case uses its own space id: access info is cached per space.
  it('404s spaces that are neither Audio nor Video', async () => {
    await expect(media.spaceMediaAccess(event({}), '1')).rejects.toMatchObject({ statusCode: 404 })
  })

  it('treats people who haven’t joined as non-members', async () => {
    state.spaces[10] = { ...audioSpace, id: 10 }
    const a = await media.spaceMediaAccess(event({}), '10')
    expect(a).toMatchObject({ member: false, admin: false })
    await expect(media.requireSpaceMember(event({}), '10')).rejects.toMatchObject({ statusCode: 403 })
  })

  it('lets people who joined in, without admin rights', async () => {
    state.spaces[11] = { ...audioSpace, id: 11 }
    state.follows = [{ follower_id: 'alice', target_id: '11' }]
    expect(await media.spaceMediaAccess(event({}), '11')).toMatchObject({ member: true, admin: false })
  })

  it('makes the owner (verified email) a space admin, and lists Directus members', async () => {
    state.spaces[12] = { ...audioSpace, id: 12 }
    state.user = { id: 'o', email: 'Owner@meeovi.test', emailVerified: true, role: 'user' }
    expect(await media.spaceMediaAccess(event({}), '12')).toMatchObject({ member: true, admin: true })
    state.user = { id: 'l', email: 'listed@meeovi.test', emailVerified: true }
    expect(await media.spaceMediaAccess(event({}), '12')).toMatchObject({ member: true, admin: false })
  })

  it('ignores an unverified email', async () => {
    state.spaces[13] = { ...audioSpace, id: 13 }
    state.user = { id: 'o', email: 'owner@meeovi.test', emailVerified: false }
    expect(await media.spaceMediaAccess(event({}), '13')).toMatchObject({ member: false, admin: false })
  })

  it('makes site admins members and admins', async () => {
    state.spaces[14] = { ...audioSpace, id: 14 }
    state.user = { id: 'boss', role: 'user, admin' }
    expect(await media.spaceMediaAccess(event({}), '14')).toMatchObject({ member: true, admin: true })
  })

  it('requires a sign-in', async () => {
    state.user = null
    await expect(media.spaceMediaAccess(event({}), '3')).rejects.toMatchObject({ statusCode: 401 })
  })
})

describe('GET /api/social/spaces/:id/media', () => {
  it('shows only allowed media and removes typed messages', async () => {
    state.follows = [{ follower_id: 'alice', target_id: '3' }]
    state.messages = {
      a1: msg('a1'),
      v1: msg('v1', { files: [{ _id: 'f-v1', name: 'v.mp4', type: 'video/mp4' }] }),
      t1: msg('t1', { files: undefined, msg: 'just text' }),
      s1: msg('s1', { t: 'uj', files: undefined }),
    }
    const res: any = await list(event({ id: '3' }, { path: '/x' }))
    expect(res.member).toBe(true)
    expect(res.kinds).toEqual(['audio'])
    expect(res.messages.map((m: any) => m.id)).toEqual(['a1'])
    expect(res.messages[0]).toMatchObject({ kind: 'audio', mine: true, canDelete: true, src: '/api/social/spaces/3/media/file/f-a1/a1.webm' })
    expect(state.deleted).toEqual(['v1', 't1'])
  })

  it('gives non-members no messages', async () => {
    state.spaces[15] = { ...audioSpace, id: 15 }
    const res: any = await list(event({ id: '15' }))
    expect(res).toMatchObject({ member: false, messages: [] })
    expect(state.calls).toEqual([])
  })
})

describe('POST /api/social/spaces/:id/media', () => {
  it('takes only the space’s kind, within the size limit, and posts as the member', async () => {
    state.user = { id: 'boss', role: 'admin' }
    state.parts = [part('video.mp4', 'video/mp4')]
    await expect(post(event({ id: '3' }))).rejects.toMatchObject({ statusCode: 415 })
    state.parts = [part('audio.webm', 'audio/webm', Buffer.concat([fixture('audio.webm'), Buffer.alloc(26 * 1024 * 1024)]))]
    await expect(post(event({ id: '3' }))).rejects.toMatchObject({ statusCode: 413 })
    state.parts = []
    await expect(post(event({ id: '3' }))).rejects.toMatchObject({ statusCode: 400 })
    state.parts = [part('recorded-audio.webm', 'audio/webm;codecs=opus')]
    expect(await post(event({ id: '3' }))).toEqual({ ok: true })
    expect(state.calls.map((c) => c.path)).toEqual(['rooms.media/room-space-media-3', 'rooms.mediaConfirm/room-space-media-3/file-new'])
  })

  it('goes by what the file really is, not the declared type', async () => {
    state.user = { id: 'boss', role: 'admin' }
    // Video declared as audio, into an Audio space.
    state.parts = [part('video.webm', 'audio/webm')]
    await expect(post(event({ id: '3' }))).rejects.toMatchObject({ statusCode: 415, statusMessage: expect.stringMatching(/has video/) })
    // Audio-only WebM labelled video (as browsers do), into a Video space.
    state.parts = [part('audio.webm', 'video/webm')]
    await expect(post(event({ id: '92' }))).rejects.toMatchObject({ statusCode: 415, statusMessage: expect.stringMatching(/no picture/) })
    // Not media at all.
    state.parts = [part('x.webm', 'audio/webm', Buffer.from('<script>alert(1)</script>'))]
    await expect(post(event({ id: '3' }))).rejects.toMatchObject({ statusCode: 415 })
    expect(state.calls).toEqual([])

    // Audio-only WebM labelled video goes into an Audio space as audio.
    state.parts = [part('audio.webm', 'video/webm')]
    expect(await post(event({ id: '3' }))).toEqual({ ok: true })
    const sent = state.calls[0]!.options.body.get('file') as File
    expect(sent.type).toBe('audio/webm')
  })

  it('refuses non-members', async () => {
    state.spaces[16] = { ...audioSpace, id: 16 }
    state.parts = [part('audio.webm', 'audio/webm')]
    await expect(post(event({ id: '16' }))).rejects.toMatchObject({ statusCode: 403 })
  })
})

describe('leaving a space', () => {
  it('takes a former member out of the room', async () => {
    state.spaces[20] = { ...audioSpace, id: 20 }
    expect(await media.revokeSpaceMedia(event({}), '20')).toBe(true)
    expect(state.removed).toEqual([{ group: 'space-media-20', user: 'alice' }])
  })

  it('keeps owners, listed members and joined members in', async () => {
    state.spaces[21] = { ...audioSpace, id: 21 }
    state.user = { id: 'l', email: 'listed@meeovi.test', emailVerified: true }
    expect(await media.revokeSpaceMedia(event({}), '21')).toBe(false)
    state.user = { id: 'alice', role: 'user' }
    state.follows = [{ follower_id: 'alice', target_id: '21' }]
    expect(await media.revokeSpaceMedia(event({}), '21')).toBe(false)
    expect(state.removed).toEqual([])
  })

  it('does nothing for spaces without a media discussion', async () => {
    expect(await media.revokeSpaceMedia(event({}), '1')).toBe(false)
    expect(state.removed).toEqual([])
  })

  it('removes non-members found reading the feed, at most every few minutes', async () => {
    state.spaces[22] = { ...audioSpace, id: 22 }
    await list(event({ id: '22' }))
    await list(event({ id: '22' }))
    await new Promise((r) => setTimeout(r, 0))
    expect(state.removed).toEqual([{ group: 'space-media-22', user: 'alice' }])
  })
})

describe('DELETE /api/social/spaces/:id/media/:msgId', () => {
  it('lets members remove their own message only', async () => {
    state.follows = [{ follower_id: 'bob', target_id: '3' }]
    state.user = { id: 'bob', role: 'user' }
    state.messages = { a1: msg('a1'), b1: msg('b1', { u: { username: 'meeovi-bob' } }) }
    await expect(remove(event({ id: '3', msgId: 'a1' }))).rejects.toMatchObject({ statusCode: 403 })
    expect(await remove(event({ id: '3', msgId: 'b1' }))).toEqual({ ok: true })
    expect(state.deleted).toEqual(['b1'])
  })

  it('lets space admins remove anyone’s message, but only in this space', async () => {
    state.user = { id: 'boss', role: 'admin' }
    state.messages = { a1: msg('a1'), x1: msg('x1', { rid: 'some-other-room' }) }
    expect(await remove(event({ id: '3', msgId: 'a1' }))).toEqual({ ok: true })
    await expect(remove(event({ id: '3', msgId: 'x1' }))).rejects.toMatchObject({ statusCode: 404 })
  })
})
