import { defineStore } from 'pinia';
export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const token = ref(null);
    const isAuthenticated = computed(() => !!user.value && !!token.value);
    const permissions = ref([]);
    function setUser(newUser) {
        user.value = newUser;
    }
    function setToken(newToken) {
        token.value = newToken;
    }
    function setPermissions(perms) {
        permissions.value = perms;
    }
    function logout() {
        user.value = null;
        token.value = null;
        permissions.value = [];
    }
    return { user, token, isAuthenticated, permissions, setUser, setToken, setPermissions, logout };
});
