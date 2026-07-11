export function useAuth() {
  const adapter = AuthAdapterRegistry.getDefaultAdapter()

  return {
    login: (payload) => adapter.login(payload),
    logout: () => adapter.logout(),
    getSession: () => adapter.getSession(),
    getProfile: () => adapter.getProfile(),
    updateProfile: (payload) => adapter.updateProfile(payload),
    register: (payload) => adapter.register(payload),
    getAdapter: () => adapter,
  }
}
