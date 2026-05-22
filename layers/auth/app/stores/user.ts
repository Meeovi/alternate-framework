
interface UserState {
  user: any | null
  profile: any | null
  loading: boolean
}

export const useUserStore = defineStore<'user', UserState>('user', {
  state: (): UserState => ({
    user: null,
    profile: null,
    loading: true
  }),

  actions: {
    setAuth(user: any, profile: any) {
      this.user = user
      this.profile = profile
      this.loading = false
    },

    setUser(user: any) {
      this.user = user
    },
    clearUser() {
      this.user = null
    },

    clear() {
      this.user = null
      this.profile = null
      this.loading = false
    }
  },

  getters: {
    isAuthenticated: (s: UserState) => !!s.user,
    isSeller: (s: UserState) => s.profile?.role?.key === 'seller' && s.profile?.seller_approved === true,
    isAdmin: (s: UserState) => s.profile?.role?.key === 'admin',
    isLoggedIn: (state: UserState) => !!state.user
  }
})
