import './types'
import { defineNuxtPlugin } from '#app'
import { createMauticClient } from './client'

export default defineNuxtPlugin((nuxtApp) => {
  const publicConfig = nuxtApp.$config?.public?.mautic || {}
  const mautic = createMauticClient(publicConfig)

  nuxtApp.provide('mautic', mautic)
})
