import { describe, expect, it } from 'vitest'
import { PRIVATE_CONTENT_COLLECTIONS, mergeDeep, privateContentFilter, privateRelationDeep } from '../../server/utils/privateContent'

const notPrivateList = { _or: [{ status: { _nin: ['Private', 'Space-only'] } }, { status: { _null: true } }] }

describe('private content', () => {
  it('shows a signed-out viewer only public rows (keeping rows with no status)', () => {
    expect(privateContentFilter('lists', null)).toEqual(notPrivateList)
  })

  it('adds the viewer\'s own private rows when signed in', () => {
    expect(privateContentFilter('lists', 'u1')).toEqual({ _or: [notPrivateList, { user: { user_id: { _eq: 'u1' } } }] })
    expect(privateContentFilter('posts', 'u1')).toMatchObject({ _or: [{ _or: [{ status: { _nin: ['Private', 'draft', 'in_review', 'scheduled'] } }, {}] }, { creator_id: { _eq: 'u1' } }] })
  })

  it('lets a private space\'s members see it too', () => {
    expect((privateContentFilter('spaces', 'u1') as any)._or[1]).toEqual({ _or: [{ owner: { _eq: 'u1' } }, { members: { directus_users_id: { _eq: 'u1' } } }] })
  })

  it('filters a list\'s items and saved products by their list', () => {
    expect(privateContentFilter('list_items', null)).toEqual({ list_id: notPrivateList })
    expect(privateContentFilter('lists_backend_products', null)).toEqual({ lists_id: notPrivateList })
  })

  it('filters private rows nested through one-to-many and many-to-many relations', () => {
    const graph = {
      edges: new Map([
        ['spaces.lists', ['spaces_lists']], ['spaces_lists.lists_id', ['lists']],
        ['lists.list_items', ['list_items']], ['posts.space', ['spaces']],
      ]),
      o2mAliases: new Set(['spaces.lists', 'lists.list_items']),
      byCollection: new Map([['spaces', ['lists']], ['lists', ['list_items']]]),
    }
    expect(privateRelationDeep(graph, 'spaces', 'id,name,lists.lists_id.*', null)).toEqual({ lists: { _filter: privateContentFilter('spaces_lists', null) } })
    const signedIn = privateRelationDeep(graph, 'spaces', ['*.*.*'], 'u1') as any
    expect(signedIn.lists._filter._and[0]).toEqual({ lists_id: { _or: [notPrivateList, { user: { user_id: { _eq: 'u1' } } }] } })
    // A many-to-one link can't take a deep filter; plain fields need none.
    expect(privateRelationDeep(graph, 'posts', 'space.*', null)).toEqual({})
    expect(privateRelationDeep(graph, 'spaces', 'lists', null)).toEqual({})
  })

  it('keeps the client\'s own deep filters alongside ours', () => {
    const merged = mergeDeep({ lists: { _filter: { id: { _gt: 1 } }, _limit: 5 } }, { lists: { _filter: { lists_id: notPrivateList } } })
    expect(merged).toEqual({ lists: { _limit: 5, _filter: { _and: [{ id: { _gt: 1 } }, { lists_id: notPrivateList }] } } })
  })

  it('shows a list–space link only when both ends may be seen', () => {
    const link = privateContentFilter('spaces_lists', null) as any
    expect(link._and.map((f: any) => Object.keys(f)[0])).toEqual(['lists_id', 'spaces_id'])
  })

  it('leaves other collections alone', () => {
    expect(privateContentFilter('products', 'u1')).toBeUndefined()
    expect(privateContentFilter('constructor', 'u1')).toBeUndefined()
    expect(PRIVATE_CONTENT_COLLECTIONS.has('navigation')).toBe(false)
  })
})
