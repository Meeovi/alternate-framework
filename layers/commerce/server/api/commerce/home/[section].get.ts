// GET /api/commerce/home/<section> — what a home page slider shows (see
// server/utils/homeSections.ts), cached for 5 minutes. Public: published
// products and public content only.
import { createError, getRouterParam } from 'h3'
import { bestSellers, deals, exclusives, featured, latestProducts, pixanomy } from '../../../utils/homeSections'

const SECTIONS: Record<string, () => Promise<unknown>> = {
  'best-sellers': async () => ({ products: await bestSellers() }),
  'latest': async () => ({ products: await latestProducts() }),
  'featured': async () => ({ products: await featured() }),
  'deals': async () => ({ products: await deals() }),
  'exclusives': exclusives,
  'pixanomy': pixanomy,
}

export default defineCachedEventHandler(async (event) => {
  const load = SECTIONS[String(getRouterParam(event, 'section') || '')]
  if (!load) throw createError({ statusCode: 404, statusMessage: 'Unknown section' })
  return load()
}, {
  name: 'home-sections',
  maxAge: 300,
  swr: true,
  getKey: (event) => String(getRouterParam(event, 'section') || '').replace(/[^\w-]/g, '').slice(0, 40),
})
