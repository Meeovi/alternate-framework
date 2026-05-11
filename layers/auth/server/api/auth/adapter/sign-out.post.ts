import { defineEventHandler } from 'h3'
import { adapterSignOut } from '../../../utils/adapter-auth'

export default defineEventHandler(async (event) => {
  return adapterSignOut(event)
})
