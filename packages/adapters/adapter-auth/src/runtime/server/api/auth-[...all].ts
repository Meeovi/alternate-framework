// src/runtime/server/api/auth-[...all].ts
import { defineEventHandler } from 'h3'
import { toWebRequest } from 'better-auth/nuxt' // or appropriate helper
import { adapterAuth } from '../auth'

export default defineEventHandler((event) => {
  return adapterAuth.handler(toWebRequest(event))
})