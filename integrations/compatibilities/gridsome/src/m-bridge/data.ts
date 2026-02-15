import type { CollectedHooks, LoadSourceActions } from '../types'

export async function runLoadSourceHooks(
  hooks: CollectedHooks,
  mDataRegistry: any, // your data adapter/registry
) {
  const actions: LoadSourceActions = {
    addCollection(name, options) {
      const collection = mDataRegistry.createCollection(name, options)
      return {
        addNode(node: any) {
          collection.add(node)
        },
      }
    },
  }

  for (const fn of hooks.loadSourceFns) {
    await fn(actions)
  }
}
