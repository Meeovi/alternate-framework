// shared/app/composables/device/useDevice.ts
import { ref } from "vue"
import { authClient } from "../../../lib/auth-client"

export function useDevice() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const message = ref<string | null>(null)

  // Validate a device code
  async function validateCode(userCode: string) {
    try {
      const formatted = userCode.trim().replace(/-/g, "").toUpperCase()
      return await authClient.device({ query: { user_code: formatted } })
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // Approve device
  async function approveDevice(userCode: string) {
    loading.value = true
    error.value = null
    try {
      const formatted = userCode.trim().replace(/-/g, "").toUpperCase()
      const res = await authClient.device.approve({ user_code: formatted })
      message.value = "Device approved"
      return res
    } catch (err: any) {
      error.value = err?.message || "Failed to approve device"
    } finally {
      loading.value = false
    }
  }

  // List authorized devices
  async function listDevices() {
    return await authClient.device.list()
  }

  // Revoke device
  async function revokeDevice(deviceId: string) {
    loading.value = true
    error.value = null
    try {
      await authClient.device.revoke({ deviceId })
      message.value = "Device revoked"
    } catch (err: any) {
      error.value = err?.message || "Failed to revoke device"
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    message,
    validateCode,
    approveDevice,
    listDevices,
    revokeDevice,
  }
}
