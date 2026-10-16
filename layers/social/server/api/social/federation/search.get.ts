// GET /api/social/federation/search?q=&limit=&networks=atproto,activitypub
// Posts matching `q` from every network that supports search (or the listed
// ones), newest first. A network that fails or times out is reported, not
// fatal.
import { createError, defineEventHandler, getQuery } from 'h3'
import { federationNetworks, withNetworkTimeout } from '../../../utils/federation'
import type { FederatedPost } from '../../../../shared/types/federation'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = String(query.q ?? '').trim().slice(0, 200)
  if (!q) throw createError({ statusCode: 400, statusMessage: 'Missing search text (q)' })
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 40)
  const only = String(query.networks ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)

  const networks = federationNetworks().filter((n) => n.searchPosts && (!only.length || only.includes(n.id)))
  const errors: Record<string, string> = {}
  const results = await Promise.all(networks.map(async (n) => {
    try {
      return await withNetworkTimeout(n.searchPosts!(q, { limit }))
    } catch (e) {
      console.error(`[federation:${n.id}] search failed:`, (e as Error)?.message || e)
      errors[n.id] = `${n.label} search is unavailable right now`
      return [] as FederatedPost[]
    }
  }))
  const posts = results.flat()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit * networks.length)
  return { posts, errors }
})
