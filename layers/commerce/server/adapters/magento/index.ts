/**
 * Magento Adapter Utilities
 *
 * Exports for Magento-specific configurations and field mappings.
 */

export { getMagentoAdapterRegistration, type MagentoAdapterRegistration } from './adapter.config'
export {
  productMapping,
  cartMapping,
  cartLineItemMapping,
  addressMapping,
  customerMapping,
  orderMapping,
  categoryMapping,
  magentoQueryPatterns,
  magentoAuthPatterns
} from './mapping'
