import { defineEventHandler } from 'h3'
import { clearMagentoCustomerToken } from '../utils/magentoSession'

export default defineEventHandler(async (event) => {
  clearMagentoCustomerToken(event)
  return { ok: true }
})
