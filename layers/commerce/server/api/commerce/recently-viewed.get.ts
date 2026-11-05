// GET /api/commerce/recently-viewed — the products the signed-in member
// opened most recently (play history kind `view`), newest first, as product
// rows. Signed-in members only; an empty list if the history can't be read.
import { requireAuth } from '#auth/server/utils/sessions'
import { historyIds } from '#social/server/utils/playHistory'
import { productsByKeys } from '../../utils/homeSections'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  try {
    return { products: await productsByKeys(await historyIds(user.id, 'view')) }
  } catch (error) {
    console.error('[recently-viewed] read failed:', (error as Error)?.message ?? error)
    return { products: [] }
  }
})
