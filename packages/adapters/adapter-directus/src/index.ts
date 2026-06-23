import { createGatewayAdapterBindings } from './runtime/index'

export const directusContentAdapter = (config = {}) => createGatewayAdapterBindings(config).content.directus