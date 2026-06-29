import type { Simplify } from '../defs/typeHelpers';
import type { SfCustomer } from "../models/customer";
import type { SfCustomerGroup, SfGender, Maybe } from "../models/shared";

export interface RegisterCustomerExtendedArgs {}
export interface RegisterCustomerCustomArgs {}

export type RegisterCustomerArgs = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  prefix?: string;
  suffix?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: SfGender;
  taxClass?: string;
  websiteId?: string;
  storeId?: string;
  groupId?: string;
  //$extended?: RegisterCustomerExtendedArgs;
  //$custom?: RegisterCustomerCustomArgs;
};

export type RegisterCustomer = (args: Simplify<RegisterCustomerArgs>) => Promise<{
  customer: SfCustomer;
}>;

export interface LoginCustomerExtendedArgs {}
export interface LoginCustomerCustomArgs {}

export type LoginCustomerArgs = {
  email: string;
  password: string;
  //$extended?: LoginCustomerExtendedArgs;
  //$custom?: LoginCustomerCustomArgs;
};

export type LoginCustomer = (args: Simplify<LoginCustomerArgs>) => Promise<{
  customer: SfCustomer;
}>;

export interface GetCustomerExtendedArgs {}
export interface GetCustomerCustomArgs {}

export type GetCustomerArgs = {
  customerId?: string;
  //$extended?: GetCustomerExtendedArgs;
  //$custom?: GetCustomerCustomArgs;
};

export type GetCustomer = (args?: Simplify<GetCustomerArgs>) => Promise<{
  customer: Maybe<SfCustomer>;
}>;

export interface LogoutCustomerExtendedArgs {}
export interface LogoutCustomerCustomArgs {}

export type LogoutCustomerArgs = {
  //$extended?: LogoutCustomerExtendedArgs;
  //$custom?: LogoutCustomerCustomArgs;
};

export type LogoutCustomer = (args?: Simplify<LogoutCustomerArgs>) => Promise<void>;

export interface UpdateCustomerExtendedArgs {}
export interface UpdateCustomerCustomArgs {}

export type UpdateCustomerArgs = {
  customerId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  prefix?: string;
  suffix?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: SfGender;
  taxClass?: string;
  //$extended?: UpdateCustomerExtendedArgs;
  //$custom?: UpdateCustomerCustomArgs;
};

export type UpdateCustomer = (args: Simplify<UpdateCustomerArgs>) => Promise<{
  customer: SfCustomer;
}>;

export interface ChangeCustomerPasswordExtendedArgs {}
export interface ChangeCustomerPasswordCustomArgs {}

export type ChangeCustomerPasswordArgs = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  //$extended?: ChangeCustomerPasswordExtendedArgs;
  //$custom?: ChangeCustomerPasswordCustomArgs;
};

export type ChangeCustomerPassword = (args: Simplify<ChangeCustomerPasswordArgs>) => Promise<void>;

export interface GetCustomerGroupsExtendedArgs {}
export interface GetCustomerGroupsCustomArgs {}

export type GetCustomerGroupsArgs = {
  //$extended?: GetCustomerGroupsExtendedArgs;
  //$custom?: GetCustomerGroupsCustomArgs;
};

export type GetCustomerGroups = (args?: Simplify<GetCustomerGroupsArgs>) => Promise<{
  groups: SfCustomerGroup[];
}>;
