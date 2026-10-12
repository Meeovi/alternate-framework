import { defineEventHandler } from 'h3'
import { assertOwnRow, rowId, sourceError, writeTarget } from '../utils/write'

/** DELETE {apiBase}/:collection/:id — delete a row (editRoles, or the row's owner on `owner` tables). */
export default defineEventHandler(async (event) => {
  const { collection, options, source, owner } = await writeTarget(event, 'remove')
  const id = rowId(event)
  await assertOwnRow(collection, options, source, id, owner)
  try {
    await source.remove!(collection, id)
    return { ok: true }
  } catch (error) {
    throw sourceError(error, `delete ${collection} ${id}`)
  }
})
