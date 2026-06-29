import type { Simplify } from '../defs/typeHelpers';
import type { SfPagination } from "../models";
import type {
  SfInvoice,
  SfOrder,
  SfOrderListItem,
  SfShipment,
  SfCreditMemo,
} from "../models/order";

export interface GetOrdersExtendedArgs {}
export interface GetOrdersCustomArgs {}

export interface GetOrdersFilters {
  customerId?: string;
  status?: string[];
  state?: string[];
  fromDate?: string;
  toDate?: string;
  paymentMethod?: string[];
  minTotal?: number;
  maxTotal?: number;
}

export type GetOrdersArgs = {
  filters?: GetOrdersFilters;
  pageSize?: number;
  currentPage?: number;
  sort?: {
    field: string;
    direction: 'ASC' | 'DESC';
  };
  //$extended?: GetOrdersExtendedArgs;
  //$custom?: GetOrdersCustomArgs;
};

export type GetOrders = (args?: Simplify<GetOrdersArgs>) => Promise<{
  orders: SfOrderListItem[];
  pagination: SfPagination;
}>;

export interface GetOrderExtendedArgs {}
export interface GetOrderCustomArgs {}

export type GetOrderArgs = {
  id: string;
  incrementId?: string;
  //$extended?: GetOrderExtendedArgs;
  //$custom?: GetOrderCustomArgs;
};

export type GetOrderDetails = (args: Simplify<GetOrderArgs>) => Promise<SfOrder>;

export interface PlaceOrderExtendedArgs {}
export interface PlaceOrderCustomArgs {}

export type PlaceOrderArgs = {
  quoteId?: string;
  paymentMethod?: Record<string, any>;
  shippingMethod?: {
    carrierCode: string;
    methodCode: string;
  };
  billingAddress?: Record<string, any>;
  shippingAddress?: Record<string, any>;
  //$extended?: PlaceOrderExtendedArgs;
  //$custom?: PlaceOrderCustomArgs;
};

export type PlaceOrder = (args?: Simplify<PlaceOrderArgs>) => Promise<{
  order: SfOrder;
}>;

export interface GetInvoicesExtendedArgs {}
export interface GetInvoicesCustomArgs {}

export type GetInvoicesArgs = {
  orderId?: string;
  pageSize?: number;
  currentPage?: number;
  //$extended?: GetInvoicesExtendedArgs;
  //$custom?: GetInvoicesCustomArgs;
};

export type GetInvoices = (args?: Simplify<GetInvoicesArgs>) => Promise<{
  invoices: SfInvoice[];
  pagination: SfPagination;
}>;

export interface GetInvoiceExtendedArgs {}
export interface GetInvoiceCustomArgs {}

export type GetInvoiceArgs = {
  id: string;
  //$extended?: GetInvoiceExtendedArgs;
  //$custom?: GetInvoiceCustomArgs;
};

export type GetInvoice = (args: Simplify<GetInvoiceArgs>) => Promise<SfInvoice>;

export interface GetShipmentsExtendedArgs {}
export interface GetShipmentsCustomArgs {}

export type GetShipmentsArgs = {
  orderId?: string;
  pageSize?: number;
  currentPage?: number;
  //$extended?: GetShipmentsExtendedArgs;
  //$custom?: GetShipmentsCustomArgs;
};

export type GetShipments = (args?: Simplify<GetShipmentsArgs>) => Promise<{
  shipments: SfShipment[];
  pagination: SfPagination;
}>;

export interface GetShipmentExtendedArgs {}
export interface GetShipmentCustomArgs {}

export type GetShipmentArgs = {
  id: string;
  //$extended?: GetShipmentExtendedArgs;
  //$custom?: GetShipmentCustomArgs;
};

export type GetShipment = (args: Simplify<GetShipmentArgs>) => Promise<SfShipment>;

export interface GetCreditMemosExtendedArgs {}
export interface GetCreditMemosCustomArgs {}

export type GetCreditMemosArgs = {
  orderId?: string;
  pageSize?: number;
  currentPage?: number;
  //$extended?: GetCreditMemosExtendedArgs;
  //$custom?: GetCreditMemosCustomArgs;
};

export type GetCreditMemos = (args?: Simplify<GetCreditMemosArgs>) => Promise<{
  creditMemos: SfCreditMemo[];
  pagination: SfPagination;
}>;

export interface GetCreditMemoExtendedArgs {}
export interface GetCreditMemoCustomArgs {}

export type GetCreditMemoArgs = {
  id: string;
  //$extended?: GetCreditMemoExtendedArgs;
  //$custom?: GetCreditMemoCustomArgs;
};

export type GetCreditMemo = (args: Simplify<GetCreditMemoArgs>) => Promise<SfCreditMemo>;
