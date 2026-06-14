import { AnalyticsBrowser } from '@segment/analytics-next'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const writeKey = config.public.segmentWriteKey as string

  if (!writeKey) {
    return
  }

  const analytics = AnalyticsBrowser.load({
    writeKey,
  })

  return {
    provide: {
      analytics,
    },
  }
})