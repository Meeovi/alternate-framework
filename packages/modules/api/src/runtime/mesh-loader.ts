export async function createMeshGateway(config) {
  const plugins = await loadPlugins(config)

  const subgraphs = [
    ...config.subgraphs,
    ...plugins.flatMap(p => p.subgraphs || [])
  ]

  const meshConfig = {
    sources: subgraphs,
    transforms: plugins.flatMap(p => p.transforms || []),
    additionalResolvers: plugins.flatMap(p => p.resolvers || [])
  }

  return createMesh(meshConfig)
}
