import type { CollectedHooks, CreatePagesContext } from '../types'

export async function runCreatePagesHooks(
  hooks: CollectedHooks,
  mRouter: any, // your route/page generator
) {
  const ctx: CreatePagesContext = {
    createPage({ path, component, context }) {
      mRouter.addRoute({
        path,
        component,
        meta: context,
      })
    },
  }

  for (const fn of hooks.createPagesFns) {
    await fn(ctx)
  }
}
