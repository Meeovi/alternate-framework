import { defineEventHandler, readBody } from 'h3'
import { adapterSignUp } from '../../../utils/adapter-auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return adapterSignUp(event, body || {})
})
