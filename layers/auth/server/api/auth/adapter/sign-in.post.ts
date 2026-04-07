import { defineEventHandler, readBody } from 'h3'
import { adapterSignIn } from '../../../utils/adapter-auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return adapterSignIn(event, body || {})
})
