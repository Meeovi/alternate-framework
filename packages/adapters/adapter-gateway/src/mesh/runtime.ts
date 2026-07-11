import { getMesh } from '@graphql-mesh/runtime'
import meshConfig from '../../mesh.config.js'

let meshInstance: Awaited<ReturnType<typeof getMesh>> | null = null

export async function getMeshInstance() {
  if (!meshInstance) {
    meshInstance = await getMesh(meshConfig)
  }
  return meshInstance
}
