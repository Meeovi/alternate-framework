import { betterAuth } from 'better-auth'

const bearerPlugin: any = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('better-auth/plugins').bearer
  } catch (e) {
    return null
  }
})()

export const bearerAuth = betterAuth({
  plugins: bearerPlugin ? [bearerPlugin({ scheme: 'Bearer' } as any)] : [],
})

export default bearerAuth
