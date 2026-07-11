import type { APISource, NormalizedEndpoint, NormalizedService } from './types'

type MeshContext = {
  adapter: {
    gateway: {
      getServices(): Promise<NormalizedService[]>
      getEndpoints(sourceName: string): Promise<NormalizedEndpoint[]>
      executeRequest(source: string, path: string, options?: any): Promise<any>
      addSource(source: APISource): void
      removeSource(name: string): boolean
    }
  }
}

export const gatewayAdapterResolvers = {
  Query: {
    gatewayServices: async (_: unknown, __: unknown, ctx: MeshContext) => {
      return ctx.adapter.gateway.getServices()
    },

    gatewayEndpoints: async (_: unknown, { sourceName }: { sourceName: string }, ctx: MeshContext) => {
      return ctx.adapter.gateway.getEndpoints(sourceName)
    },

    gatewayExecute: async (_: unknown, args: { sourceName: string; path: string; options?: any }, ctx: MeshContext) => {
      const result = await ctx.adapter.gateway.executeRequest(args.sourceName, args.path, args.options)
      return {
        ok: result.ok,
        data: result.ok ? result.data : null,
        error: result.ok ? null : result.error,
        status: 200
      }
    }
  },

  Mutation: {
    gatewayAddSource: async (_: unknown, { source }: { source: any }, ctx: MeshContext) => {
      ctx.adapter.gateway.addSource(source)
      return true
    },

    gatewayRemoveSource: async (_: unknown, { name }: { name: string }, ctx: MeshContext) => {
      return ctx.adapter.gateway.removeSource(name)
    }
  }
}