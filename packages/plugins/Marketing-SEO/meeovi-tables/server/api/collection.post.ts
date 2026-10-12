import { defineEventHandler, setResponseStatus } from 'h3'
import { editableBody, sourceError, writeTarget } from '../utils/write'

/** POST {apiBase}/:collection — create a row (editRoles, or anyone signed in on `owner` tables). */
export default defineEventHandler(async (event) => {
  const { collection, options, source, userId, userName } = await writeTarget(event, 'create')
  const data = { ...options.defaults, ...(await editableBody(event, collection, options, source, 'create')) }
  // `owner` tables: the row belongs to whoever creates it.
  if (options.owner) data[options.owner] = userId
  if (options.ownerName && userName) data[options.ownerName] = userName
  try {
    const row = await source.create!(collection, data)
    setResponseStatus(event, 201)
    return { row }
  } catch (error) {
    throw sourceError(error, `create the ${collection} row`)
  }
})
