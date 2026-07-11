// layers/social/plugins/social-adapter.ts

import { useSocialAdapter, setDefaultSocialAdapter, SocialDriverRegistry } from '@mframework/alternate-sdk/social/adapter'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()

  const socialAdapter = useSocialAdapter()
  setDefaultSocialAdapter(socialAdapter)

  return {
    provide: {
      social: socialAdapter
    }
  }
})