import { defineNuxtPlugin } from '#app'
import { AtpAgent } from '@atproto/api'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const agent = new AtpAgent({ service: config.public.atproto.service })

  nuxtApp.provide('atproto', agent)
})
