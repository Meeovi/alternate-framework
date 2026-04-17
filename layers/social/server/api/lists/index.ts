import { defineEventHandler } from 'h3'
import { proxyListsRequest } from '../../utils/lists-proxy'

export default defineEventHandler(async (event) => {
  return proxyListsRequest(event)
})
