import { defineEventHandler } from 'h3'
import { getAdapterSession, getAuthBackend } from '../../../utils/adapter-auth'

export default defineEventHandler(async (event) => {
  const session = await getAdapterSession(event)
  return {
    backend: getAuthBackend(),
    ...session,
  }
})
