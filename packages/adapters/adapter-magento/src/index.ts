// packages/adapters/adapter-magento/src/index.ts
import { GraphQLClient } from 'graphql-request'
import type { Query } from './graphql/schema-types' // Generated via mesh-compose types
import { normalizeProductToPage } from './normalizers/normalizers'
import type { RawMagentoInventory } from './normalizers/inventory'

export class MagentoAdapter {
  [x: string]: any;
  private client: GraphQLClient

  // Namespace our calls to match your normalized alternate-sdk footprint
  public store = {
    /**
     * Reads complex product or category matrices from Magento through the composed Mesh.
     * `entity` is the Magento query/entity name (e.g. "Product", "InventorySource").
     */
    readEntity: async (
      entity: string,
      argumentsPayload: Record<string, any>,
      options: { fields: string[] | Record<string, any>[] | any }
    ): Promise<any> => {
      
      const meshKey = `MGT_${entity}`
      const selectionString = this.parseFieldsToQuery(options.fields as any[])
      
      // Serialize runtime object arguments into stringified inline GraphQL variables/arguments
      const inlineArgs = this.serializeArguments(argumentsPayload)
      const argumentString = inlineArgs ? `(${inlineArgs})` : ''

      const query = `
        query GetMagentoEntity {
          ${String(meshKey)}${argumentString} {
            ${selectionString}
          }
        }
      `

      const data = await this.client.request<Record<string, any>>(query)
      return data[meshKey]
    }
  }

  public content = {
  readItem: async (collection: string, id: string | number, options: any) => {
    
    // 1. Fetch raw payload using your standard query builder
    const rawData = await this.fetchRawMagentoData(id, options.fields)
    
    // 2. Automate structural transformation if the app is asking for a 'pages' layout
    if (collection === 'pages' && rawData) {
      return normalizeProductToPage(rawData) // Handled safely by schema types!
    }
    
    return rawData
  }
}

  /**
   * Inventory (MSI) contract — implements the layer's CommerceClient interface.
   * Magento exposes stock through the `products` query (`stock_status`,
   * `only_x_left_in_stock`); source-level operations use the MSI GraphQL
   * entities. All mapping happens here so the layer composable can blindly
   * trust the interface.
   */
  private async fetchProductStock(identifier: { sku?: string; id?: string }): Promise<RawMagentoInventory | null> {
    const filter = identifier.sku
      ? { sku: { eq: identifier.sku } }
      : { ids: { eq: identifier.id } }

    const query = `
      query GetProductStock($filter: ProductFilterInput!) {
        products(filter: $filter) {
          items {
            sku
            stock_status
            only_x_left_in_stock
          }
        }
      }
    `

    const data = await this.client.request<{
      products: { items: Array<{ sku: string; stock_status: string; only_x_left_in_stock: number | null }> }
    }>(query, { filter })

    const item = data?.products?.items?.[0]
    if (!item) return null

    return {
      sku: item.sku,
      qty: item.only_x_left_in_stock ?? 0,
      is_in_stock: item.stock_status === 'IN_STOCK',
    }
  }

  private toSfStockItem(raw: RawMagentoInventory | null): any {
    if (!raw) return null
    const qty = typeof raw.qty === 'number' ? raw.qty : 0
    return {
      itemId: raw.sku,
      productId: raw.sku,
      sku: raw.sku,
      stockId: '1',
      qty,
      minQty: 0,
      isInStock: raw.is_in_stock ?? qty > 0,
      backorders: 0,
      minSaleQty: 1,
      maxSaleQty: 10000,
      notifyStockQty: 1,
      websiteId: '1',
      stockStatus: raw.is_in_stock ? 'in_stock' : 'out_of_stock',
      lowStockDate: undefined,
      enableQtyIncrements: false,
      qtyIncrements: 1,
      isQtyDecimal: false,
      useConfigMinQty: true,
      useConfigNotifyStockQty: true,
      useConfigBackorders: true,
      useConfigMinSaleQty: true,
      useConfigMaxSaleQty: true,
      useConfigEnableQtyIncrements: true,
      extensionAttributes: {},
      metadata: {},
    }
  }

  async checkInventory(sku: string, qty: number): Promise<boolean> {
    const stock = await this.fetchProductStock({ sku })
    return !!stock && (stock.qty ?? 0) >= qty
  }

  async getStockBySku(sku: string): Promise<any> {
    return this.toSfStockItem(await this.fetchProductStock({ sku }))
  }

  async getStockByProductId(productId: string): Promise<any> {
    return this.toSfStockItem(await this.fetchProductStock({ id: productId }))
  }

  async listInventorySources(): Promise<any[]> {
    const data = await this.store.readEntity('InventorySource', {}, { fields: ['code', 'name', 'enabled', 'type'] })
    const sources = Array.isArray(data) ? data : (data?.items ?? [])
    return sources.map((source: any) => ({
      id: source.code,
      code: source.code,
      name: source.name,
      enabled: source.enabled ?? true,
      type: source.type ?? 'default',
    }))
  }

  async listInventorySourceItems(params: { sourceCode: string; skus: string[] }): Promise<any[]> {
    const data = await this.store.readEntity('SourceItem', {
      source_code: params.sourceCode,
      skus: params.skus,
    }, { fields: ['sku', 'source_code', 'quantity', 'status'] })
    const items = Array.isArray(data) ? data : (data?.items ?? [])
    return items.map((item: any) => ({
      productId: item.sku,
      sku: item.sku,
      sourceId: item.source_code,
      qty: typeof item.quantity === 'number' ? item.quantity : 0,
      minQty: 0,
      useConfigMinQty: true,
      isQtyDecimal: false,
      backorders: 0,
      minSaleQty: 1,
      maxSaleQty: 10000,
      isInStock: item.status === 1,
      notifyStockQty: 1,
    }))
  }

  async assignStockToSource(payload: { sourceCode: string; sku: string; qty: number; status?: number }): Promise<any> {
    return this.store.readEntity('SourceItem', {
      source_code: payload.sourceCode,
      sku: payload.sku,
      quantity: payload.qty,
      status: payload.status ?? 1,
    }, { fields: ['sku', 'source_code', 'quantity', 'status'] })
  }

  constructor(endpoint: string, storeCode?: string, customerToken?: string) {
    this.client = new GraphQLClient(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...(storeCode ? { 'Store': storeCode } : {}),
        ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {})
      },
    })
  }

  /**
   * Translates alternative fields matrices into clean inline GraphQL properties
   */
  private parseFieldsToQuery(fields: any[]): string {
    if (!Array.isArray(fields)) return 'sku'
    
    return fields.map(field => {
      if (typeof field === 'string') {
        return field === '*' ? 'sku' : field 
      }
      if (typeof field === 'object') {
        return Object.entries(field).map(([key, nestedFields]) => {
          return `${key} { \n ${this.parseFieldsToQuery(nestedFields as any[])} \n }`
        }).join('\n')
      }
      return ''
    }).join('\n')
  }

  /**
   * Helper to convert JS configuration objects directly into inline query arguments
   */
  private serializeArguments(args: Record<string, any>): string {
    return Object.entries(args)
      .map(([key, val]) => `${key}: ${JSON.stringify(val).replace(/"([^"]+)":/g, '$1:')}`)
      .join(', ')
  }
}