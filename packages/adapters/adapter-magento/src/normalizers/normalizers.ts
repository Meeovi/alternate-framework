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
import { normalizeMagentoCustomerGroup } from './customerGroups'
import { normalizeMagentoCustomerAddress } from './customerAddresses'
import { normalizeMagentoProductReview } from './productReviews'
import { normalizeMagentoWishlist } from './wishlists'
import { normalizeMagentoOrderItem } from './orderItems'
import { normalizeMagentoPaymentToken } from './paymentTokens'
import { normalizeMagentoProductLink } from './productLinks'
import { normalizeMagentoTierPrice } from './tierPrices'
import { normalizeMagentoGiftWrapping } from './giftWrappings'
import { normalizeMagentoGiftRegistry } from './giftRegistries'
import { normalizeMagentoReturn } from './returns'
import { normalizeMagentoSalesRule } from './salesRules'
import { normalizeMagentoSharedCatalog } from './sharedCatalogs'
import { normalizeMagentoTransaction } from './transactions'
import { normalizeMagentoDynamicBlock } from './dynamicBlocks'
import { normalizeMagentoPoll } from './polls'
import { normalizeMagentoCarrier } from './carriers'
import { normalizeMagentoGlossaryTerm } from './glossaryTerms'
import { normalizeMagentoPurchaseOrder } from './purchaseOrders'
import { normalizeMagentoCompanyAccount } from './companyAccounts'
import { normalizeMagentoInvitation } from './invitations'
import { normalizeMagentoApprovalRule } from './approvalRules'
import { normalizeMagentoAffiliate } from './affiliates'
import { normalizeMagentoChannel } from './channels'
import { normalizeMagentoAdminActionLog } from './adminActionLogs'
import { normalizeMagentoCatalogEvent } from './catalogEvents'

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
  tfa: normalizeMagentoTfa,
  customergroups: normalizeMagentoCustomerGroup,
  customeraddresses: normalizeMagentoCustomerAddress,
  productreviews: normalizeMagentoProductReview,
  wishlists: normalizeMagentoWishlist,
  orderitems: normalizeMagentoOrderItem,
  paymenttokens: normalizeMagentoPaymentToken,
  productlinks: normalizeMagentoProductLink,
  tierprices: normalizeMagentoTierPrice,
  giftwrappings: normalizeMagentoGiftWrapping,
  giftregistries: normalizeMagentoGiftRegistry,
  returns: normalizeMagentoReturn,
  salesrules: normalizeMagentoSalesRule,
  sharedcatalogs: normalizeMagentoSharedCatalog,
  transactions: normalizeMagentoTransaction,
  dynamicblocks: normalizeMagentoDynamicBlock,
  polls: normalizeMagentoPoll,
  carriers: normalizeMagentoCarrier,
  glossaryterms: normalizeMagentoGlossaryTerm,
  purchaseorders: normalizeMagentoPurchaseOrder,
  companyaccounts: normalizeMagentoCompanyAccount,
  invitations: normalizeMagentoInvitation,
  approvalrules: normalizeMagentoApprovalRule,
  affiliates: normalizeMagentoAffiliate,
  channels: normalizeMagentoChannel,
  adminactionlogs: normalizeMagentoAdminActionLog,
  catalogevents: normalizeMagentoCatalogEvent
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
export * from './customerGroups'
export * from './customerAddresses'
export * from './productReviews'
export * from './wishlists'
export * from './orderItems'
export * from './paymentTokens'
export * from './productLinks'
export * from './tierPrices'
export * from './giftWrappings'
export * from './giftRegistries'
export * from './returns'
export * from './salesRules'
export * from './sharedCatalogs'
export * from './transactions'
export * from './dynamicBlocks'
export * from './polls'
export * from './carriers'
export * from './glossaryTerms'
export * from './purchaseOrders'
export * from './companyAccounts'
export * from './invitations'
export * from './approvalRules'
export * from './affiliates'
export * from './channels'
export * from './adminActionLogs'
export * from './catalogEvents'
