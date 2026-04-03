export interface DirectusGatewayAdapterContract {
  getSchema(collection: string): Promise<unknown>;
  getItem(collection: string, id: string): Promise<unknown>;
  createItem(collection: string, input: Record<string, unknown>): Promise<unknown>;
}