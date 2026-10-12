import { defineEventHandler } from 'h3'
import { assertOwnRow, editableBody, rowId, sourceError, writeTarget } from '../utils/write'

/** PATCH {apiBase}/:collection/:id — update a row (editRoles, or the row's owner on `owner` tables). */
export default defineEventHandler(async (event) => {
  const { collection, options, source, owner } = await writeTarget(event, 'update')
  const id = rowId(event)
  await assertOwnRow(collection, options, source, id, owner)
  const data = await editableBody(event, collection, options, source, 'update')
  try {
    return { row: await source.update!(collection, id, data) }
  } catch (error) {
    throw sourceError(error, `update ${collection} ${id}`)
  }
})
