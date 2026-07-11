// packages/adapters/adapter-magento/src/normalizers/index.ts
import { normalizeProductToPage, normalizeMagentoProduct } from './products'
import { normalizeMagentoCart } from './cart'
import { normalizeMagentoVendor } from './vendors'
import { normalizeMagentoOrder } from './orders'
import { normalizeMagentoBlock } from './blocks'
import { normalizeMagentoCategory } from './category'
import { normalizeMagentoCompany } from './company'
import { normalizeMagentoCoupon } from './coupons'
import { normalizeMagentoCreditMemo } from './creditmemo'
import { normalizeMagentoCustomer } from './customers'
import { normalizeMagentoCountry } from './directory'
import { normalizeMagentoGift } from './gifts'
import { normalizeMagentoInventory } from './inventory'
import { normalizeMagentoInvoice } from './invoice'
import { normalizeMagentoPage } from './pages'
import { normalizeMagentoPayment } from './payments'
import { normalizeMagentoQuote } from './quotes'
import { normalizeMagentoRequisitionList } from './requisitionLists'
import { normalizeMagentoReward } from './reward'
import { normalizeMagentoSearch } from './search'
import { normalizeMagentoShipment } from './shipment'
import { normalizeMagentoStock } from './stock'
import { normalizeMagentoStore } from './store'
import { normalizeMagentoTax } from './tax'
import { normalizeMagentoTeam } from './team'
import { normalizeMagentoTfa } from './tfa'

/**
 * Master Marketplace Normalizer Registry
 * Maps the incoming frontend collection request tokens directly to their modular translation strategy.
 */
export const magentoNormalizers: Record<string, (raw: any) => any> = {
  pages: normalizeProductToPage,
  products: normalizeMagentoProduct,
  carts: normalizeMagentoCart,
  vendors: normalizeMagentoVendor,
  orders: normalizeMagentoOrder,
  blocks: normalizeMagentoBlock,
  categories: normalizeMagentoCategory,
  companies: normalizeMagentoCompany,
  coupons: normalizeMagentoCoupon,
  creditmemos: normalizeMagentoCreditMemo,
  customers: normalizeMagentoCustomer,
  directory: normalizeMagentoCountry,
  gifts: normalizeMagentoGift,
  inventory: normalizeMagentoInventory,
  invoices: normalizeMagentoInvoice,
  quotes: normalizeMagentoQuote,
  requisitionlists: normalizeMagentoRequisitionList,
  rewards: normalizeMagentoReward,
  search: normalizeMagentoSearch,
  shipment: normalizeMagentoShipment,
  stock: normalizeMagentoStock,
  stores: normalizeMagentoStore,
  taxes: normalizeMagentoTax,
  teams: normalizeMagentoTeam,
  tfa: normalizeMagentoTfa
}

// Re-export types so they are accessible cleanly across package boundaries
export * from './products'
export * from './cart'
export * from './vendors'
export * from './orders'
export * from './blocks'
export * from './category'
export * from './company'
export * from './coupons'
export * from './creditmemo'
export * from './customers'
export * from './directory'
export * from './gifts'
export * from './inventory'
export * from './invoice'
export * from './pages'
export * from './payments'
export * from './quotes'
export * from './requisitionLists'
export * from './reward'
export * from './search'
export * from './shipment'
export * from './stock'
export * from './store'
export * from './tax'
export * from './team'
export * from './tfa'
