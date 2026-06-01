import { Polar } from '@polar-sh/sdk'

export async function getScope(log: boolean = true) {
  const accessToken = process.env.POLAR_OAT
  const settled = {
    sandbox: await new Polar({ accessToken, server: 'sandbox' }).organizations.list({})
      .then(() => ({ status: 'fulfilled' as const }))
      .catch(() => ({ status: 'rejected' as const })),
    production: await new Polar({ accessToken, server: 'production' }).organizations.list({})
      .then(() => ({ status: 'fulfilled' as const }))
      .catch(() => ({ status: 'rejected' as const })),
  }

  if (settled.sandbox.status === 'fulfilled') {
    if (log) console.info('The token scope is of `sandbox`.')
    return 'sandbox'
  }
  if (log) console.info('The token scope is of `production`.')
  return 'production'
}

export async function setScope() {
  const scope = await getScope()
  const dotenvx = await import('@dotenvx/dotenvx')
  dotenvx.set('POLAR_MODE', scope, { encrypt: false })
}