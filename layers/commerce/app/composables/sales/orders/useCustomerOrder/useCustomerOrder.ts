import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Maybe, SfOrder, SfOrderLineItem } from '~/composables/system/models';
import type {
  UseCustomerOrderReturn,
  UseCustomerOrderState,
  FetchCustomerOrder,
} from './types';
import { useHandleError } from '../../../system/useHandleError/useHandleError';
import { useAsyncData, useState } from 'nuxt/app';
import { getCommerceClient } from '../../../../utils/client';

const money = (amount: number) => ({ currency: 'USD', amount, precisionAmount: amount.toFixed(2) })

const fallbackOrder: SfOrder = {
  id: '0e4fec5a-61e6-48b8-94cc-d5f77687e2b0',
  incrementId: '000000123',
  orderNumber: '123',
  status: 'complete',
  state: 'complete',
  customerId: '1',
  customerEmail: 'john.doe@example.com',
  customerIsGuest: false,
  customerNoteNotify: false,
  totalQtyOrdered: 1,
  totalQtyInvoiced: 1,
  totalQtyRefunded: 0,
  totalQtyReturned: 0,
  totalQtyCanceled: 0,
  totalQtyShipped: 1,
  baseDiscountAmount: money(0),
  discountAmount: money(0),
  baseSubtotal: money(295.87),
  subtotal: money(295.87),
  baseTaxAmount: money(24.65),
  taxAmount: money(24.65),
  baseGrandTotal: money(320.52),
  grandTotal: money(320.52),
  baseTotalDue: money(0),
  totalDue: money(0),
  baseTotalPaid: money(320.52),
  totalPaid: money(320.52),
  baseTotalRefunded: money(0),
  totalRefunded: money(0),
  shippingAmount: money(0),
  baseShippingAmount: money(0),
  shippingDescription: 'Free Shipping',
  shippingMethod: 'freeshipping_freeshipping',
  shippingName: 'Free Shipping',
  shippingTaxAmount: money(0),
  baseShippingTaxAmount: money(0),
  weight: 1,
  emailSent: true,
  canShipPartially: true,
  canShipPartiallyItem: true,
  createdAt: '2022-08-11T00:00:00Z',
  updatedAt: '2022-08-11T00:00:00Z',
  orderDate: '2022-08-11',
  items: [
    {
      id: '1',
      orderId: '0e4fec5a-61e6-48b8-94cc-d5f77687e2b0',
      productId: '1',
      productName: 'Product Name',
      productSku: 'SKU001',
      productType: 'simple',
      quantity: 1,
      qtyCanceled: 0,
      qtyInvoiced: 1,
      qtyRefunded: 0,
      qtyReturned: 0,
      qtyShipped: 1,
      basePrice: money(295.87),
      baseDiscountAmount: money(0),
      baseDiscountInvoiced: money(0),
      baseDiscountRefunded: money(0),
      baseOriginalPrice: money(295.87),
      basePriceInclTax: money(320.52),
      baseRowTotal: money(295.87),
      baseRowTotalInclTax: money(320.52),
      baseTaxAmount: money(24.65),
      baseTaxInvoiced: money(24.65),
      baseTaxRefunded: money(0),
      baseWeeeTaxAppliedAmount: 0,
      baseWeeeTaxDisposition: 0,
      baseWeeeTaxRowDisposition: 0,
      discountAmount: money(0),
      discountInvoiced: money(0),
      discountRefunded: money(0),
      freeShipping: true,
      image: { url: '/images/product.png', alt: 'Product' },
      isVirtual: false,
      price: money(295.87),
      priceInclTax: money(320.52),
      rowTotal: money(295.87),
      rowTotalInclTax: money(320.52),
      rowWeight: 1,
      sku: 'SKU001',
      taxes: [],
      unitPrice: money(295.87),
      unitPriceInclTax: money(320.52),
      weeeTaxApplied: '',
      weeeTaxAppliedAmount: 0,
      weeeTaxDisposition: 0,
      weeeTaxRowDisposition: 0,
    } as SfOrderLineItem,
  ],
  payment: {
    method: 'checkmo',
    additionalInformation: {},
    amountOrdered: money(320.52),
    amountPaid: money(320.52),
    amountRefunded: money(0),
    shippingAmount: money(0),
    taxAmount: money(24.65),
  },
  billingAddress: {
    address1: '123 Main St',
    city: 'Albany',
    country: 'US',
    firstName: 'Hieronim',
    lastName: 'Anonim',
    phoneNumber: '+1 321 765 0987',
    postalCode: '12205',
    state: 'NY',
    titleCode: '',
  },
  shippingAddress: {
    address1: '123 Main St',
    city: 'Albany',
    country: 'US',
    firstName: 'Hieronim',
    lastName: 'Anonim',
    phoneNumber: '+1 321 765 0987',
    postalCode: '12205',
    state: 'NY',
    titleCode: '',
  },
  shippingMethod: {
    carrierCode: 'freeshipping',
    carrierTitle: 'Free Shipping',
    methodCode: 'freeshipping',
    methodTitle: 'Free Shipping',
    amount: 0,
    baseAmount: 0,
    available: true,
    priceExclTax: money(0),
    priceInclTax: money(0),
  },
};

const getCustomerOrder = async (id: string): Promise<SfOrder> => {
  const client = getCommerceClient();
  if (client && typeof client.getOrder === 'function') {
    const result = await client.getOrder(id);
    if (result) return result as SfOrder;
  }
  if (client && typeof client.getOrderByIncrementId === 'function') {
    const result = await client.getOrderByIncrementId(id);
    if (result) return result as SfOrder;
  }
  return fallbackOrder;
};

export const useCustomerOrder: UseCustomerOrderReturn = (id) => {
  const state = useState<UseCustomerOrderState>(`useCustomerOrder-${id}`, () => ({
    data: null,
    loading: false,
  }));

  const fetchCustomerOrder: FetchCustomerOrder = async (id) => {
    state.value.loading = true;
    try {
      const { data, error } = await useAsyncData<SfOrder>(() => getCustomerOrder(id));
      useHandleError(error.value);
      state.value.data = data.value ?? null;
      state.value.loading = false;
      return data as unknown as ReturnType<FetchCustomerOrder>;
    } catch (error) {
      state.value.loading = false;
      throw error;
    }
  };

  return {
    fetchCustomerOrder,
    ...toRefs(state.value),
  };
};
