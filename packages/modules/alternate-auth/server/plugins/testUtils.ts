// Test utilities for the auth layer — lightweight helpers used in development
// These use alternate-gateway/core when available, otherwise provide simple fallbacks.

export async function createTestUser(data: any = {}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const core = require('alternate-gateway/core')
    if (core?.prisma && core.prisma.user) {
      const user = await core.prisma.user.create({ data })
      return user
    }
  } catch (e) {
    // ignore and return a mock
  }
  return { id: 'test-' + Math.random().toString(36).slice(2, 8), ...data }
}

export function resetTestData() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const core = require('alternate-gateway/core')
    if (core?.prisma) {
      // best-effort: truncate common tables if the adapter exposes them
      return Promise.all([
        core.prisma.user?.deleteMany?.({})?.catch(() => {}),
        core.prisma.session?.deleteMany?.({})?.catch(() => {}),
      ])
    }
  } catch (e) {
    // ignore
  }
  return Promise.resolve()
}

export default defineNitroPlugin(() => {})
