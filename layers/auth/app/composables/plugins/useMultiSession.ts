// composables/useMultiSession.ts
import { ref } from 'vue'
import { authClient } from '../../../lib/auth-client'
import type { BetterAuthDeviceSession } from '../../types'

export function useMultiSession() {
  const isProcessing = ref(false)
  const sessions = ref<BetterAuthDeviceSession[]>([])
  const errorMsg = ref<string | null>(null)
  const successMsg = ref<string | null>(null)

  const fetchSessions = async () => {
    isProcessing.value = true
    errorMsg.value = null
    try {
      const { data, error } = await (authClient as any).multiSession.listDeviceSessions()
      if (error) throw new Error(error.message || 'Failed to load sessions')
      sessions.value = (data || []) as BetterAuthDeviceSession[]
    } catch (err: any) {
      errorMsg.value = err.message
    } finally {
      isProcessing.value = false
    }
  }

  const switchSession = async (sessionToken: string) => {
    isProcessing.value = true
    errorMsg.value = null
    successMsg.value = null
    try {
      const { error } = await (authClient as any).multiSession.setActive({ sessionToken })
      if (error) throw new Error(error.message || 'Failed to switch accounts')

      successMsg.value = 'Switched session successfully!'
      window.location.reload()
    } catch (err: any) {
      errorMsg.value = err.message
    } finally {
      isProcessing.value = false
    }
  }

  const revokeSession = async (sessionToken: string) => {
    isProcessing.value = true
    errorMsg.value = null
    successMsg.value = null
    try {
      const { error } = await (authClient as any).multiSession.revoke({ sessionToken })
      if (error) throw new Error(error.message || 'Failed to revoke session')

      successMsg.value = 'Session successfully revoked!'
      await fetchSessions()
    } catch (err: any) {
      errorMsg.value = err.message
    } finally {
      isProcessing.value = false
    }
  }

  return {
    isProcessing,
    sessions,
    errorMsg,
    successMsg,
    fetchSessions,
    switchSession,
    revokeSession
  }
}