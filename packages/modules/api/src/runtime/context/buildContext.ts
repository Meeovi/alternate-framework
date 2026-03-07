import type { MFrameworkContext } from './types'
import type { MFrameworkPlugin } from '../../plugins/definePlugin'

export async function buildContext(
  base: MFrameworkContext,
  plugins: MFrameworkPlugin[]
): Promise<MFrameworkContext> {
  let ctx = base
  for (const plugin of plugins) {
    if (plugin.extendContext) {
      ctx = await plugin.extendContext(ctx)
    }
  }
  return ctx
}
