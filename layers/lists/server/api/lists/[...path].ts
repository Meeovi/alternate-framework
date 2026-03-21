import { defineEventHandler } from 'h3'
import { proxyListsRequest } from '../../utils/lists-proxy'

export default defineEventHandler(async (event) => {
  const path = event.context.params?.path
  const suffix = Array.isArray(path) ? `/${path.join('/')}` : path ? `/${path}` : ''

  return proxyListsRequest(event, suffix)
})