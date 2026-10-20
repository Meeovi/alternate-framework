import { describe, expect, it } from 'vitest'
import { PRIVATE_CONTENT_COLLECTIONS, privateContentFilter } from '../../server/utils/privateContent'

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

  it('leaves other collections alone', () => {
    expect(privateContentFilter('products', 'u1')).toBeUndefined()
    expect(privateContentFilter('constructor', 'u1')).toBeUndefined()
    expect(PRIVATE_CONTENT_COLLECTIONS.has('navigation')).toBe(false)
  })
})
