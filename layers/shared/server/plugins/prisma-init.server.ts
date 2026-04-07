import { defineNitroPlugin } from '#imports'

export default defineNitroPlugin(async () => {
  const isProd = process.env.NODE_ENV === 'production'
  const enableInDev = process.env.SHARED_ENABLE_PRISMA_IN_DEV === 'true'

  if (!isProd && !enableInDev) {
    console.info('[shared] Prisma init skipped in development. Set SHARED_ENABLE_PRISMA_IN_DEV=true to enable.')
    return
  }

  try {
    const [{ initializePrisma }, prismaModule] = await Promise.all([
      import('alternate-gateway/core'),
      import('../../../../packages/modules/alternate-gateway/core/prisma/generated/prisma/client'),
    ])

    const PrismaClient = (prismaModule as any).PrismaClient
    initializePrisma(PrismaClient)
  } catch (error) {
    if (isProd) {
      throw error
    }

    console.warn('[shared] Prisma initialization skipped', error)
  }
})
