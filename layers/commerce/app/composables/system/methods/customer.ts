import type { Simplify } from '../defs/typeHelpers';
import type { SfCreateAddressBody, SfCustomerAddress, SfId } from "../models";

export interface CreateCustomerAddressExtendedArgs {}
export interface CreateCustomerAddressCustomArgs {}

export type CreateCustomerAddressArgs = {
  address: SfCreateAddressBody;
  //$extended?: CreateCustomerAddressExtendedArgs;
  //$custom?: CreateCustomerAddressCustomArgs;
};

export type CreateCustomerAddress = (args: Simplify<CreateCustomerAddressArgs>) => Promise<{
  address: SfCustomerAddress;
}>;

export interface UpdateCustomerAddressExtendedArgs {}
export interface UpdateCustomerAddressCustomArgs {}

export type UpdateCustomerAddressArgs = {
  id: SfId;
  address: SfCreateAddressBody;
  //$extended?: UpdateCustomerAddressExtendedArgs;
  //$custom?: UpdateCustomerAddressCustomArgs;
};

export type UpdateCustomerAddress = (args: Simplify<UpdateCustomerAddressArgs>) => Promise<{
  address: SfCustomerAddress;
}>;

export interface DeleteCustomerAddressExtendedArgs {}
export interface DeleteCustomerAddressCustomArgs {}

export type DeleteCustomerAddressArgs = {
  id: SfId;
  //$extended?: DeleteCustomerAddressExtendedArgs;
  //$custom?: DeleteCustomerAddressCustomArgs;
};

export type DeleteCustomerAddress = (args: Simplify<DeleteCustomerAddressArgs>) => Promise<void>;

export interface GetCustomerAddressesExtendedArgs {}
export interface GetCustomerAddressesCustomArgs {}

export type GetCustomerAddressesArgs = {
  customerId?: SfId;
  //$extended?: GetCustomerAddressesExtendedArgs;
  //$custom?: GetCustomerAddressesCustomArgs;
};

export type GetCustomerAddresses = (args?: Simplify<GetCustomerAddressesArgs>) => Promise<{
  addresses: SfCustomerAddress[];
}>;
