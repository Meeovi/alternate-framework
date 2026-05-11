import type { UserLogin } from '../../../../shared/shared/types'
import { computed, ref } from 'vue'
import { useStorage } from '@vueuse/core'

export type User = UserLogin & {
  notifications?: any[]
  [key: string]: any
}

export const currentUser = ref<User | null>(null)
export const currentServer = ref('')
export const publicServer = ref('')
export const currentInstance = ref<any>(null)
export const currentNodeInfo = ref<any>(null)
export const users = ref<User[]>([])

const instanceCache = new Map<string, unknown>()
export const instanceStorage = {
  getItem(key: string) {
    return instanceCache.get(key)
  },
  setItem(key: string, value: unknown) {
    instanceCache.set(key, value)
  },
  removeItem(key: string) {
    instanceCache.delete(key)
  },
}

export function getInstanceCache(key: string) {
  return instanceCache.get(key)
}

export const currentUserHandle = computed(() => {
  const acct = currentUser.value?.account?.acct
  return acct ? `@${acct}` : ''
})

export const isGlitchEdition = computed(() => {
  const version = String(currentNodeInfo.value?.version || currentInstance.value?.version || '')
  return /glitch/i.test(version)
})

export function useCurrentUser() {
  return currentUser
}

export function useUsers() {
  return users
}

export function setCurrentUser(user: User | null) {
  currentUser.value = user
  currentServer.value = user?.server || currentServer.value
  if (user && !users.value.find(existing => existing.account?.id === user.account?.id))
    users.value.push(user)
}

export async function refreshAccountInfo() {
  return currentUser.value
}

export function checkLogin() {
  return Boolean(currentUser.value)
}

export function getInstanceDomain(instance?: { uri?: string } | string | null) {
  if (typeof instance === 'string')
    return instance

  if (instance?.uri)
    return instance.uri

  return currentServer.value || publicServer.value || ''
}

export function useUserLocalStorage<T>(key: string, initial: () => T) {
  return useStorage<T>(key, initial(), localStorage)
}

export async function removePushNotificationData(user: User | null = currentUser.value) {
  if (!user)
    return
  user.pushSubscription = undefined
}

export async function removePushNotifications(user: User | null = currentUser.value) {
  if (!user)
    return
  user.notifications = []
}
