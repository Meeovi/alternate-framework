import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

type MethodResolver = (client: CommerceClient, ...args: any[]) => Promise<any>

export function createEnterpriseResource(methods: Record<string, MethodResolver>) {
  const client = getCommerceClient() as CommerceClient
  const result: Record<string, (...args: any[]) => Promise<any>> = {}

  for (const [name, resolver] of Object.entries(methods)) {
    result[name] = (...args: any[]) => resolver(client, ...args)
  }

  return result
}

export function createCrudResource(
  resource: string,
  extras: Record<string, MethodResolver> = {}
) {
  const R = resource.charAt(0).toUpperCase() + resource.slice(1)
  return createEnterpriseResource({
    [`list${R}s`]: (client, params?: Record<string, any>) => (client as any)[`list${R}s`](params),
    [`get${R}ById`]: (client, id: string) => (client as any)[`get${R}ById`](id),
    [`create${R}`]: (client, data: Record<string, any>) => (client as any)[`create${R}`](data),
    [`update${R}`]: (client, id: string, data: Record<string, any>) => (client as any)[`update${R}`]({ id, ...data }),
    [`delete${R}`]: (client, id: string) => (client as any)[`delete${R}`](id),
    ...extras,
  })
}
