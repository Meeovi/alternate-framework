export default eventHandler(async () => {
  const auth = useServerAuth()
  const dbModule = await import('better-auth/db').catch(() => null as any)
  const getMigrations = (dbModule as any)?.getMigrations
  if (typeof getMigrations !== 'function') {
    return 'No migrations to run'
  }
  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options)
  if (!toBeCreated.length && !toBeAdded.length) {
    return 'No migrations to run'
  }
  await runMigrations()
  return 'Database migrations ran successfully'
})