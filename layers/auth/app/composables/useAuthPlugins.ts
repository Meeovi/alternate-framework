/**
 * Which auth plugin packages an admin has switched on (GET
 * /api/auth/plugin/enabled), by id — e.g. `isOn('sso')`. Pages show a
 * plugin's sign-in option only while it's on; a plugin that's off answers
 * 404 anyway.
 */
export function useAuthPlugins() {
  const { data, refresh } = useFetch<{ plugins: string[] }>('/api/auth/plugin/enabled', {
    key: 'auth-plugins-enabled',
    default: () => ({ plugins: [] }),
  })
  const enabled = computed(() => data.value?.plugins ?? [])
  return { enabled, isOn: (id: string) => enabled.value.includes(id), refresh }
}
