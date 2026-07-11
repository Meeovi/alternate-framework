import { describe, it, expect, vi } from 'vitest'
import { useStock } from '../../app/composables/catalog/inventory/useStock'
import { getCommerceClient } from '../../app/utils/client'

// Mock the client retriever
vi.mock('../../app/utils/client', () => ({
  getCommerceClient: vi.fn()
}))

describe('useStock Refactor Verification', () => {
  it('should call the strict interface methods directly without crashing', async () => {
    // 1. Mock a strict compliant adapter implementing the StockProvider contract
    const mockStockAdapter = {
      getStockItemBySku: vi.fn().mockResolvedValue({ sku: 'TEST-SKU', quantity: 10, salableQuantity: 10, status: 'in_stock' }),
      getSources: vi.fn().mockResolvedValue([{ id: '1', code: 'default', name: 'Default' }]),
      adjustStock: vi.fn().mockResolvedValue({ sku: 'TEST-SKU', quantity: 10, salableQuantity: 10, status: 'in_stock' }),
      reserve: vi.fn().mockResolvedValue({ sku: 'TEST-SKU', quantity: 5, salableQuantity: 5, status: 'in_stock' }),
      release: vi.fn().mockResolvedValue({ sku: 'TEST-SKU', quantity: 10, salableQuantity: 10, status: 'in_stock' }),
    }

    vi.mocked(getCommerceClient).mockReturnValue(mockStockAdapter as any)

    const { fetchStockItemBySku, fetchSources, adjustStock, reserve, release } = useStock()

    // 2. Test execution flow
    const stockItem = await fetchStockItemBySku('TEST-SKU')
    const sources = await fetchSources()
    await adjustStock('TEST-SKU', 10, 'adjustment')
    await reserve('TEST-SKU', 5, 'ref-1')
    await release('TEST-SKU', 5, 'ref-1')

    // 3. Assertions ensuring the adapter was targeted cleanly
    expect(mockStockAdapter.getStockItemBySku).toHaveBeenCalledWith('TEST-SKU', undefined)
    expect(stockItem?.quantity).toBe(10)
    expect(sources).toHaveLength(1)
    expect(mockStockAdapter.adjustStock).toHaveBeenCalledWith('TEST-SKU', 10, 'adjustment', undefined)
    expect(mockStockAdapter.reserve).toHaveBeenCalledWith('TEST-SKU', 5, 'ref-1')
    expect(mockStockAdapter.release).toHaveBeenCalledWith('TEST-SKU', 5, 'ref-1')
  })
})
