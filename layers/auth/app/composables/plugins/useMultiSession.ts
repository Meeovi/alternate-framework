// composables/useMultiSession.ts
import { ref } from 'vue'
import { authClient } from '../../../lib/auth-client'

export interface DeviceSession {
  id: string
  sessionToken: string
  userId: string
  userAgent?: string
  ipAddress?: string
  createdAt: string
  expiresAt: string
  // Extend with basic user details if returned in your payload
  user?: {
    email: string
    name?: string
    image?: string
  }
}

export function useMultiSession() {
  const isProcessing = ref(false)
  const sessions = ref<DeviceSession[]>([])
  const errorMsg = ref<string | null>(null)
  const successMsg = ref<string | null>(null)

  const fetchSessions = async () => {
    isProcessing.value = true
    errorMsg.value = null
    try {
      const { data, error } = await authClient.multiSession.listDeviceSessions() //
      if (error) throw new Error(error.message || 'Failed to load sessions')
      
      // Cast the response appropriately based on your better-auth type schema
      sessions.value = (data || []) as unknown as DeviceSession[]
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
      const { error } = await authClient.multiSession.setActive({ sessionToken }) //
      if (error) throw new Error(error.message || 'Failed to switch accounts')
      
      successMsg.value = 'Switched session successfully!'
      // Refresh the page or reload local states as Nuxt needs to pick up new cookies
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
      const { error } = await authClient.multiSession.revoke({ sessionToken }) //
      if (error) throw new Error(error.message || 'Failed to revoke session')
      
      successMsg.value = 'Session successfully revoked!'
      await fetchSessions() // Refresh active list
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