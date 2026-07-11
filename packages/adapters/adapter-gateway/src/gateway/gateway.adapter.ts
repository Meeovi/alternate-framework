import { executeMesh } from '../mesh/client.js'
import { getMeshInstance } from '../mesh/runtime.js'
import { buildQuery } from './dynamic-query.js'
import { dynamicNormalize } from './dynamic-normalizer.js'
import type { APISource } from '../../types'

export async function fetchType(typeName: string, fields?: string[]) {
  const query = await buildQuery(typeName, fields)
  const result = await executeMesh<any>(query)

  const raw = result[typeName.toLowerCase()]
  return dynamicNormalize(raw)
}

export class GatewayAdapter {
  private readonly config: Record<string, any>
  private readonly sources: APISource[]
  private meshPromise: Promise<any> | null = null
  private meshInitialized = false

  constructor(options: { sources?: APISource[]; envPrefix?: string } = {}) {
    this.sources = options.sources || []
    this.config = {
      sources: this.sources,
      enabled: true,
      envPrefix: options.envPrefix || 'MESH_SOURCE_'
    }
  }

  health(): string {
    return 'ok'
  }

  private async ensureMesh() {
    if (this.meshInitialized) return
    this.meshPromise = this.meshPromise || getMeshInstance()
    try {
      await this.meshPromise
      this.meshInitialized = true
    } catch {
      this.meshInitialized = false
      this.meshPromise = null
    }
  }

  async executeRequest(sourceName: string, path: string, options?: any): Promise<Record<string, any>> {
    const source = this.sources.find((s) => s.name === sourceName || s.type === sourceName)
    if (!source) {
      return { ok: false as const, error: `Source ${sourceName} not found` }
    }

    const isDatabaseSource = ['mongoose', 'mysql', 'mariadb', 'postgraphile'].includes(source.type)
    if (isDatabaseSource) {
      return { ok: false as const, error: `Database sources (${source.type}) are handled via GraphQL Mesh, not direct executeRequest` }
    }

    try {
      const url = new URL(path, source.endpoint)

      if (options?.query) {
        Object.entries(options.query).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            url.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
          }
        })
      }

      const hasBody = options?.body !== undefined && options?.body !== null && options?.method && options.method !== 'GET' && options.method !== 'HEAD'
      const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData

      const res = await fetch(url.toString(), {
        method: options?.method || 'GET',
        headers: {
          ...(!isFormData && hasBody ? { 'Content-Type': 'application/json' } : {}),
          ...(source.headers || {}),
          ...(options?.headers || {})
        },
        body: hasBody ? (isFormData ? (options?.body as BodyInit) : JSON.stringify(options?.body)) : undefined
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        return { ok: false as const, error: data?.message || 'Request failed' }
      }

      return { ok: true as const, data }
    } catch (err: any) {
      return { ok: false as const, error: err.message || 'Request error' }
    }
  }

  async executeMeshQuery(query: string, variables?: Record<string, any>): Promise<Record<string, any>> {
    await this.ensureMesh()
    if (!this.meshInitialized) {
      return { ok: false as const, error: 'GraphQL Mesh is not initialized' }
    }

    try {
      const mesh = await this.meshPromise!
      const result = await mesh.execute(query, variables)
      return { ok: true as const, data: result }
    } catch (err: any) {
      return { ok: false as const, error: err?.message || 'Mesh execution failed' }
    }
  }

  async getServices(): Promise<Record<string, any>[]> {
    return this.sources.map((s) => ({
      id: s.name,
      name: s.name,
      endpoints: [],
      sources: [{ id: s.name, name: s.name, type: s.type, endpoint: s.endpoint }]
    }))
  }

  async getEndpoints(_sourceName: string): Promise<Record<string, any>[]> {
    return []
  }

  addSource(source: APISource): void {
    if (!this.sources.find((s) => s.name === source.name)) {
      this.sources.push(source)
    }
  }

  removeSource(name: string): boolean {
    const index = this.sources.findIndex((s) => s.name === name)
    if (index > -1) {
      this.sources.splice(index, 1)
      return true
    }
    return false
  }
}
