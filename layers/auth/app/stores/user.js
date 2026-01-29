import { defineStore } from 'pinia';
export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        profile: null,
        loading: true
    }),
    actions: {
        setAuth(user, profile) {
            this.user = user;
            this.profile = profile;
            this.loading = false;
        },
        setUser(user) {
            this.user = user;
        },
        clearUser() {
            this.user = null;
        },
        clear() {
            this.user = null;
            this.profile = null;
            this.loading = false;
        }
    },
    getters: {
        isAuthenticated: (s) => !!s.user,
        isSeller: (s) => s.profile?.role?.key === 'seller' && s.profile?.seller_approved === true,
        isAdmin: (s) => s.profile?.role?.key === 'admin',
        isLoggedIn: (state) => !!state.user
    }
});
