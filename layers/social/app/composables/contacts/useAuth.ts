export default function useAuth() {
  return {
    user: null,
    isLoggedIn: false,
    async login() {
      return null
    },
    logout() {
      this.user = null
      this.isLoggedIn = false
    }
  }
}
