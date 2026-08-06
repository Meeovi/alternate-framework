// composables/useDeviceAuth.ts
import { ref, onBeforeUnmount } from 'vue'
import { authClient } from '../../../lib/auth-client'
import type {
  BetterAuthPasskey,
  BetterAuthUser,
  BetterAuthSession,
  DeviceCodeResponse,
  DeviceTokenResponse,
  DeviceActionResponse,
} from '../../types'

export function useDeviceAuth() {
  const isProcessing = ref(false)
  const errorMsg = ref<string | null>(null)
  const successMsg = ref<string | null>(null)

  const deviceCodeData = ref<{
    userCode: string
    verificationUri: string
    verificationUriComplete: string
    deviceCode: string
  } | null>(null)

  let pollingTimeoutId: NodeJS.Timeout | null = null
  let pollingInterval = 5

  const requestDeviceCode = async (clientId: string = 'your-client-id') => {
    isProcessing.value = true
    errorMsg.value = null
    successMsg.value = null
    deviceCodeData.value = null

    try {
      const { data, error } = await (authClient as any).device.code({
        client_id: clientId,
        scope: 'openid profile email',
      })

      if (error) {
        throw new Error((error as any).error_description || 'Failed to request device code')
      }

      if (data) {
        deviceCodeData.value = {
          userCode: data.user_code,
          verificationUri: data.verification_uri,
          verificationUriComplete: data.verification_uri_complete || '',
          deviceCode: data.device_code
        }

        pollingInterval = data.interval || 5
        startPolling(clientId, data.device_code)
      }
    } catch (err: any) {
      errorMsg.value = err.message || 'An unexpected error occurred'
    } finally {
      isProcessing.value = false
    }
  }

  const startPolling = (clientId: string, deviceCode: string) => {
    stopPolling()

    const poll = async () => {
      const { data, error } = await (authClient as any).device.token({
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code: deviceCode,
        client_id: clientId,
        fetchOptions: {
          headers: {
            'user-agent': 'My Nuxt App Client',
          },
        },
      })

      if (data?.access_token) {
        successMsg.value = 'Authorization successful! This device is now linked.'
        stopPolling()
      } else if (error) {
        switch (error.error) {
          case 'authorization_pending':
            pollingTimeoutId = setTimeout(poll, pollingInterval * 1000)
            break
          case 'slow_down':
            pollingInterval += 5
            pollingTimeoutId = setTimeout(poll, pollingInterval * 1000)
            break
          case 'access_denied':
            errorMsg.value = 'Access was denied by the user.'
            stopPolling()
            break
          case 'expired_token':
            errorMsg.value = 'The code has expired. Please request a new one.'
            stopPolling()
            break
          default:
            errorMsg.value = error.error_description || 'Authentication failed'
            stopPolling()
        }
      }
    }

    pollingTimeoutId = setTimeout(poll, pollingInterval * 1000)
  }

  const stopPolling = () => {
    if (pollingTimeoutId) {
      clearTimeout(pollingTimeoutId)
      pollingTimeoutId = null
    }
  }

  const submitUserCode = async (userCode: string) => {
    isProcessing.value = true
    errorMsg.value = null
    successMsg.value = null

    try {
      const { data, error } = await (authClient as any).device.verify({
        userCode: userCode,
      })

      if (error) throw new Error(error.error_description || 'Invalid code.')
      return data
    } catch (err: any) {
      errorMsg.value = err.message || 'Failed to verify code'
      return null
    } finally {
      isProcessing.value = false
    }
  }

  const approveDevice = async (userCode: string) => {
    isProcessing.value = true
    errorMsg.value = null
    successMsg.value = null

    try {
      const { error } = await (authClient as any).device.approve({
        userCode: userCode,
        scopes: ['openid', 'profile', 'email']
      })

      if (error) throw new Error(error.error_description || '')
      successMsg.value = 'Device successfully authorized!'
      return true
    } catch (err: any) {
      errorMsg.value = err.message || 'Failed to approve device'
      return false
    } finally {
      isProcessing.value = false
    }
  }

  const denyDevice = async (userCode: string) => {
    isProcessing.value = true
    errorMsg.value = null
    successMsg.value = null

    try {
      const { error } = await (authClient as any).device.deny({
        userCode: userCode,
      })

      if (error) throw new Error(error.error_description || '')
      successMsg.value = 'Device authorization request denied.'
      return true
    } catch (err: any) {
      errorMsg.value = err.message || 'Failed to deny request'
      return false
    } finally {
      isProcessing.value = false
    }
  }

  onBeforeUnmount(() => {
    stopPolling()
  })

  return {
    isProcessing,
    errorMsg,
    successMsg,
    deviceCodeData,
    requestDeviceCode,
    stopPolling,
    submitUserCode,
    approveDevice,
    denyDevice,
  }
}