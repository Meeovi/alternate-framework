import { consola } from 'consola'

export default defineNitroPlugin(() => {
  if (!import.meta.dev) {
    return
  }
  const migrate = async () => {
    const auth = serverAuth()
    const adapterId = String((auth as any)?.options?.database?.id || '')
    const isKyselyAdapter = /kysely/i.test(adapterId)

    // Better Auth migrate helper supports Kysely only. This layer uses Prisma.
    if (!isKyselyAdapter) {
      consola.info('[better-auth] Skipping dev auto-migrations: non-kysely adapter detected.')
      return
    }

    const dbModule = await import('better-auth/db').catch(() => null as any)
    const getMigrations = (dbModule as any)?.getMigrations
    if (typeof getMigrations !== 'function') {
      consola.info('[better-auth] Skipping dev auto-migrations: getMigrations is unavailable for current better-auth version.')
      return
    }

    const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options)
    if (!toBeCreated.length && !toBeAdded.length) {
      return
    }
    consola.info(`[better-auth] Database migrations will affect the following tables:`)

    for (const table of [...toBeCreated, ...toBeAdded]) {
      consola.log(`\`${table.table}\` table with ${Object.keys(table.fields).map(f => `\`${f}\``).join(', ')} fields.`)
    }
    await runMigrations()
    consola.success('[better-auth] Database migrations ran successfully')
  }

  const hook = (globalThis as any).onHubReady
  if (typeof hook === 'function') {
    hook(migrate)
    return
  }

  void migrate()
})