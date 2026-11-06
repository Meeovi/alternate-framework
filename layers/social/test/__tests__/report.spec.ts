import { beforeEach, describe, expect, it, vi } from 'vitest'

// Session, Directus and the Bluesky network are mocked: no logins or writes.
const state = vi.hoisted(() => ({
  user: { id: 'member-1', email: 'member@example.com', username: 'member' } as Record<string, string> | null,
  body: null as unknown,
  items: {} as Record<string, unknown[]>,
  created: [] as Array<{ collection: string, data: any }>,
  ozone: [] as any[],
  ozoneFails: false,
}))

vi.mock('#auth/server/utils/sessions', () => ({
  requireAuth: async () => {
    if (!state.user) throw Object.assign(new Error('Unauthorized'), { statusCode: 401 })
    return state.user
  },
}))
vi.mock('h3', async (orig) => ({ ...(await orig<typeof import('h3')>()), readBody: async () => state.body }))
vi.mock('@directus/sdk', () => {
  const client: any = { with: () => client, request: async (op: any) => op() }
  return {
    createDirectus: () => client,
    rest: () => ({}),
    staticToken: () => ({}),
    readItems: (collection: string, query: any) => async () =>
      (state.items[collection] ?? []).filter((row: any) => query.filter.mageos_sku
        ? row.mageos_sku === query.filter.mageos_sku._eq
        : String(row.id) === String(query.filter.id._eq)),
    createItem: (collection: string, data: any) => async () => {
      state.created.push({ collection, data })
      return { id: state.created.length }
    },
  }
})
vi.mock('../../server/utils/federation', () => ({
  useFederationNetwork: (id: string) => ({ id }),
  requireCapability: () => async (input: any) => {
    if (state.ozoneFails) throw new Error('Ozone is down')
    state.ozone.push(input)
    return { id: 'ozone-1' }
  },
  withNetworkTimeout: (p: Promise<unknown>) => p,
}))

const { default: handler } = await import('../../server/api/social/moderation/report.post')
const send = (body: unknown) => { state.body = body; return (handler as any)({ node: { req: { headers: {} } }, context: {} }) }

beforeEach(() => {
  state.user = { id: 'member-1', email: 'member@example.com', username: 'member' }
  state.items = { posts: [{ id: 135 }], products: [{ id: 7 }, { id: 8, mageos_sku: 'LOOP-4' }] }
  state.created = []
  state.ozone = []
  state.ozoneFails = false
})

describe('POST /api/social/moderation/report', () => {
  it('stores a Meeovi note report in Directus with its id, the member email and a link to the note', async () => {
    expect(await send({ network: 'meeovi', subject: { kind: 'note', id: '135' }, reasonType: 'spam', details: 'Ads' })).toEqual({ ok: true, id: '1' })
    expect(state.created).toEqual([{ collection: 'report', data: {
      title: 'Note reported: Spam or unwanted promotion',
      content: 'Ads',
      network: 'meeovi',
      content_type: 'note',
      content_id: '135',
      reporter_email: 'member@example.com',
      posts: [{ posts_id: 135 }],
    } }])
    expect(state.ozone).toEqual([])
  })

  it('links products through report_products', async () => {
    await send({ network: 'meeovi', subject: { kind: 'product', id: '7' }, reasonType: 'misleading' })
    expect(state.created[0]!.data).toMatchObject({ content_type: 'product', content_id: '7', content: null, products: [{ products_id: 7 }] })
  })

  it('links a store product through its Directus mirror, and keeps unmirrored ones by key', async () => {
    await send({ network: 'meeovi', subject: { kind: 'product', id: 'magento:LOOP-4' }, reasonType: 'spam' })
    await send({ network: 'meeovi', subject: { kind: 'product', id: 'magento:NEW-1' }, reasonType: 'spam' })
    expect(state.created[0]!.data).toMatchObject({ content_id: 'magento:LOOP-4', products: [{ products_id: 8 }] })
    expect(state.created[1]!.data.content_id).toBe('magento:NEW-1')
    expect(state.created[1]!.data.products).toBeUndefined()
  })

  it("refuses content that doesn't exist, and accounts on Meeovi", async () => {
    await expect(send({ network: 'meeovi', subject: { kind: 'note', id: '999' }, reasonType: 'spam' })).rejects.toMatchObject({ statusCode: 404 })
    await expect(send({ network: 'meeovi', subject: { kind: 'account', id: 'u1' }, reasonType: 'spam' })).rejects.toMatchObject({ statusCode: 400 })
    expect(state.created).toEqual([])
  })

  it('stores a Bluesky report in Directus and also files it in Ozone', async () => {
    const uri = 'at://did:plc:abc/app.bsky.feed.post/3k'
    await send({ network: 'atproto', subject: { kind: 'note', id: uri }, reasonType: 'rude', details: 'Insults' })
    expect(state.created[0]!.data).toEqual({
      title: 'Note reported: Harassment, hate or abuse', content: 'Insults', network: 'atproto',
      content_type: 'note', content_id: uri, reporter_email: 'member@example.com',
    })
    expect(state.ozone[0]).toMatchObject({ subject: { kind: 'note', id: uri }, reasonType: 'rude' })
    expect(state.ozone[0].reason).toContain('Directus report 1')
  })

  it('still succeeds when Ozone is down, since the report is stored', async () => {
    state.ozoneFails = true
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await send({ network: 'atproto', subject: { kind: 'account', id: 'did:plc:abc' }, reasonType: 'spam' })).toEqual({ ok: true, id: '1' })
    spy.mockRestore()
  })

  it('needs a signed-in member and a reason', async () => {
    await expect(send({ network: 'meeovi', subject: { kind: 'note', id: '135' } })).rejects.toMatchObject({ statusCode: 400 })
    state.user = null
    await expect(send({ network: 'meeovi', subject: { kind: 'note', id: '135' }, reasonType: 'spam' })).rejects.toMatchObject({ statusCode: 401 })
  })
})
