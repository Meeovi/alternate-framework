// composables/useOneTimeToken.ts
import { ref } from 'vue'
import { authClient } from '../../../lib/auth-client'

export function useOneTimeToken() {
  const isProcessing = ref(false)
  const errorMsg = ref<string | null>(null)
  const successMsg = ref<string | null>(null)

  const generatedToken = ref<string | null>(null)
  const verifiedSession = ref<any | null>(null)

  // 1. Generate an OTT (requires an active user session in the browser)
  const generateToken = async () => {
    isProcessing.value = true
    errorMsg.value = null
    successMsg.value = null
    generatedToken.value = null

    try {
      const { data, error } = await authClient.oneTimeToken.generate() //
      if (error) throw new Error(error.message || 'Failed to generate token')
      
      if (data?.token) {
        generatedToken.value = data.token
        successMsg.value = 'One-time token generated! It is valid for 3 minutes.'
      }
    } catch (err: any) {
      errorMsg.value = err.message
    } finally {
      isProcessing.value = false
    }
  }

  // 2. Verify an OTT (Redeem it to gain or verify access)
  const verifyToken = async (token: string) => {
    isProcessing.value = true
    errorMsg.value = null
    successMsg.value = null
    verifiedSession.value = null

    try {
      const { data, error } = await authClient.oneTimeToken.verify({ token }) //
      if (error) throw new Error(error.message || 'Verification failed. The token may be expired or already used.')

      if (data) {
        verifiedSession.value = data
        successMsg.value = 'Token successfully verified and redeemed!'
      }
    } catch (err: any) {
      errorMsg.value = err.message
    } finally {
      isProcessing.value = false
    }
  }

  return {
    isProcessing,
    errorMsg,
    successMsg,
    generatedToken,
    verifiedSession,
    generateToken,
    verifyToken
  }
}