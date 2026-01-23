import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const user = ref<any>({});

  function setUser(newUser: any) {
    user.value = newUser;
  }

  function clearUser() {
    user.value = {};
  }

  return {
    user,
    setUser,
    clearUser,
  };
});
