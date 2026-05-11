import { createMediaEngine, type MediaEngineFactoryOptions } from 'alternate-gateway/media/createMediaEngine'

export type SharedMediaProvider = {
  create: (options?: MediaEngineFactoryOptions) => ReturnType<typeof createMediaEngine>
}

export default defineNuxtPlugin(() => {
  const media: SharedMediaProvider = {
    create: (options = {}) => createMediaEngine(options),
  }

  return {
    provide: {
      media,
    },
  }
})
