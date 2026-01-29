
import { ref } from 'vue'
import { getAtprotoAgent, wrapAgent } from '../client'

export const useAtproto = () => {
  const agent = getAtprotoAgent() || (globalThis as any).__meeovi_atproto
  const client = agent && agent.login ? wrapAgent(agent) : agent
  const session = ref<any | null>(null)
  const error = ref<string | null>(null)

  const login = async (identifier: string, password: string) => {
    try {
      const res = await client.login({ identifier, password })
      session.value = res
      return res
    } catch (err: any) {
      error.value = err?.message || String(err)
      throw err
    }
  }

  const register = async (email: string, handle: string, password: string, inviteCode?: string) => {
    try {
      const res = await client.createAccount({ email, handle, password, inviteCode })
      session.value = res
      return res
    } catch (err: any) {
      error.value = err?.message || String(err)
      throw err
    }
  }

  const createPost = async (text: string, embed?: any, reply?: any) => {
    return await client.post({
      text,
      createdAt: new Date().toISOString(),
      embed,
      reply
    })
  }

  const getTimeline = async (limit = 20) => {
    const res = await client.getTimeline({ limit })
    return res?.data?.feed ?? res
  }

  const logout = async () => {
    session.value = null
    error.value = null
    client?.sessionManager?.clearSession?.()
  }

  return {
    session,
    error,
    login,
    register,
    createPost,
    getTimeline,
    logout
  }
}
