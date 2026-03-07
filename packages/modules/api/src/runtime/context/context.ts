export async function buildContext(req, plugins) {
  let ctx = { headers: req.headers, cookies: req.cookies }

  for (const plugin of plugins) {
    if (plugin.context) {
      ctx = await plugin.context(ctx)
    }
  }

  return ctx
}
