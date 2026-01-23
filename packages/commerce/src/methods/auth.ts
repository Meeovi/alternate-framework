import type { Simplify } from "type-fest";
import type { Maybe, SfCustomer } from "../models";

export interface RegisterCustomerExtendedArgs {}
export interface RegisterCustomerCustomArgs {}

export type RegisterCustomerArgs = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
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
  email?: string;
  firstName?: string;
  lastName?: string;
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
  // eslint-disable-next-line unicorn/no-keyword-prefix
  newPassword: string;
  confirmPassword: string;
  //$extended?: ChangeCustomerPasswordExtendedArgs;
  //$custom?: ChangeCustomerPasswordCustomArgs;
};

export type ChangeCustomerPassword = (args: Simplify<ChangeCustomerPasswordArgs>) => Promise<void>;
