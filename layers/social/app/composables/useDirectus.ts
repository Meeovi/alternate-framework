import { ref } from 'vue'

export function useDirectusAuth() {
  const user = ref(null)
  return { user }
}

export function useDirectusClient() {
  // Minimal shim for build-time; production should use the real Directus adapter.
  return {
    async get() { return null },
    async post() { return null },
  }
}

export default useDirectusAuth
