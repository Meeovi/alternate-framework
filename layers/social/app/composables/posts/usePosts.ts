// composables/usePosts.ts
import { AtpAgent } from '@atproto/api'

export const usePosts = () => {
  const config = useRuntimeConfig()
  const agent = new AtpAgent({ service: `${config.public.atprotoPds}` })

  const createPost = async (text: string, embed?: any, reply?: any) => {
    return await agent.post({
      text,
      createdAt: new Date().toISOString(),
      embed,
      reply
    })
  }

  const getTimeline = async (limit = 20) => {
    return await agent.getTimeline({ limit })
  }

  return { createPost, getTimeline }
}