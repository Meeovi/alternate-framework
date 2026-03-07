import type { MFrameworkComposeConfig, MFrameworkGatewayConfig } from '../../config/types'
import type { MFrameworkPluginRef } from '../../config/types'
import type { MFrameworkContext } from '../context/types'
import { createMeshGateway } from '../mesh/createMeshGateway'
import { buildContext } from '../context/buildContext'

async function loadPlugins(refs: MFrameworkPluginRef[]) {
  const plugins = []
  for (const ref of refs) {
    const mod = await import(ref.module)
    plugins.push((mod.default || mod) as any)
  }
  return plugins
}

export function createHandler(
  composeConfig: MFrameworkComposeConfig,
  gatewayConfig: MFrameworkGatewayConfig
) {
  let meshPromise: Promise<any> | null = null
  let pluginsPromise: Promise<any[]> | null = null

  async function ensureMesh() {
    if (!pluginsPromise) {
      pluginsPromise = loadPlugins(composeConfig.plugins || [])
    }
    const plugins = await pluginsPromise

    if (!meshPromise) {
      meshPromise = createMeshGateway(composeConfig, plugins)
    }

    const mesh = await meshPromise
    return { mesh, plugins }
  }

  return async function handler(req: any, res: any) {
    const { mesh, plugins } = await ensureMesh()

    const baseContext: MFrameworkContext = {
      headers: req.headers || {},
      cookies: req.cookies || {}
    }

    const context = await buildContext(baseContext, plugins)

    const { query, variables, operationName } = req.body

    const result = await mesh.execute(query, variables, context, operationName)

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify(result))
  }
}
