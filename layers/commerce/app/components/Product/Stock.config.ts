export enum StockStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  BACKORDER = 'backorder',
}

export type StockStatusType = StockStatus

export const StockStatusDefaults = {
  [StockStatus.IN_STOCK]: 'In stock',
  [StockStatus.OUT_OF_STOCK]: 'Out of stock',
  [StockStatus.BACKORDER]: 'Backorder',
}

export default StockStatus
