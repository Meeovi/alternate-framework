import { createError, defineEventHandler, getRouterParam, sendRedirect } from 'h3'
import { listItem, publicNote, publishedProduct } from '../../../utils/activitypub/content'
import { sitePaths } from '../../../utils/activitypub/config'

/** A browser opening a note/product/list item's fediverse id goes to its page on Meeovi. */
export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, 'id') ?? '')
  const product = /^product-(\d{1,18})$/.exec(id)
  const item = /^list-item-(\d{1,12})$/.exec(id)
  const row = product ? await publishedProduct(product[1]!) : item ? await listItem(item[1]!) : await publicNote(id)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  const path = product ? sitePaths.product(row as any) : item
    ? sitePaths.list({ id: typeof row.list_id === 'object' ? row.list_id?.id : row.list_id })
    : sitePaths.note(row as any)
  return sendRedirect(event, path, 302)
})
