import { H3Event } from 'h3'

// TODO: Replace with actual auth API import
const auth = { api: { listSessions: () => [] } }

export default defineEventHandler((event: H3Event) => {
  return auth.api.listSessions()
})