export async function loadPlugins(config) {
  const plugins = []

  for (const plugin of config.plugins) {
    const mod = await import(plugin)
    plugins.push(mod.default)
  }

  return plugins
}
