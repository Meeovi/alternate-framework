import { defineNuxtPlugin } from '#app'
import { useRuntimeConfig } from '@nuxt/kit'
import { ofetch } from 'ofetch'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const client = ofetch.create({
    baseURL: config.public.magento.endpoint,
    headers: {
      'Content-Type': 'application/json',
      ...(config.public.magento.token
        ? { Authorization: `Bearer ${config.public.magento.token}` }
        : {})
    }
  })

  nuxtApp.provide('magento', client)
})
