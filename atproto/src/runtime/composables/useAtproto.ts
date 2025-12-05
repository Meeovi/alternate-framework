
import { ref } from 'vue'

export const useAtproto = () => {
  const { $atproto } = useNuxtApp()
  const session = ref<any | null>(null)
  const error = ref<string | null>(null)

  const login = async (identifier: string, password: string) => {
    try {
      const res = await $atproto.login({ identifier, password })
      session.value = res
      return res
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const register = async (email: string, handle: string, password: string, inviteCode?: string) => {
    try {
      const res = await $atproto.createAccount({ email, handle, password, inviteCode })
      session.value = res
      return res
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const createPost = async (text: string, embed?: any, reply?: any) => {
    return await $atproto.post({
      text,
      createdAt: new Date().toISOString(),
      embed,
      reply
    })
  }

  const getTimeline = async (limit = 20) => {
    const res = await $atproto.getTimeline({ limit })
    return res.data.feed
  }

  const logout = async () => {
    session.value = null
    error.value = null
    $atproto.sessionManager.clearSession()
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
