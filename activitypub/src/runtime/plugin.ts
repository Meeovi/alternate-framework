import { defineNuxtPlugin } from '#app'
import { ofetch } from 'ofetch'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const client = ofetch.create({
    baseURL: config.public.activitypub.server,
    headers: {
      'Accept': 'application/activity+json'
    }
  })

  nuxtApp.provide('activitypub', client)
})
