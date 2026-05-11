import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '../types/commerce.type'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const roles = ref<string[]>([])

  function setUser(u: User | null) {
    user.value = u
    roles.value = u?.roles ?? []
  }

  return { user, roles, setUser }
})
