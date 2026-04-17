import type { InferCustom } from "../defs";

export type Maybe<TType> = TType | null;

export type SfId = string;

export interface SfMoneyCustom extends InferCustom<"normalizeMoney"> {}

export interface SfMoney {
  currency: string;
  amount: number;
  precisionAmount: string;
  $custom?: SfMoneyCustom;
}

export interface SfDiscountablePriceCustom extends InferCustom<"normalizeDiscountablePrice"> {}

export interface SfDiscountablePrice {
  isDiscounted: boolean;
  regularPrice: SfMoney;
  /**
   * Price with discounts. If there is no discount, it will be the same as regularPrice
   */
  value: SfMoney;
  $custom?: SfDiscountablePriceCustom;
}

export interface SfImageCustom extends InferCustom<"normalizeImage"> {}

export interface SfImage {
  alt: Maybe<string>;
  url: string;
  $custom?: SfImageCustom;
}

export interface SfAttributeCustom extends InferCustom<"normalizeAttribute"> {}

export interface SfAttribute {
  label: string;
  name: string;
  value: string;
  valueLabel: string;
  $custom?: SfAttributeCustom;
}

export interface SfCreateAddressBody {
  address1: string;
  address2?: Maybe<string>;
  city: string;
  country: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  postalCode: string;
  state: string;
  titleCode: string;
}

export interface SfAddressCustom extends InferCustom<"normalizeAddress"> {}

export interface SfAddress {
  address1: Maybe<string>;
  address2?: Maybe<string>;
  city: Maybe<string>;
  country: Maybe<string>;
  firstName: Maybe<string>;
  lastName: Maybe<string>;
  phoneNumber: Maybe<string>;
  postalCode: Maybe<string>;
  state: Maybe<string>;
  titleCode: Maybe<string>;
  $custom?: SfAddressCustom;
}

export type SfCurrency = string;

export type SfLocale = string;

export type SfLanguage = string;

export type SfCountry = string;

export type SfRegion = string;

export type SfZipCode = string;

export type SfPhoneNumber = string;

export type SfEmail = string;

export type SfPassword = string;

export type SfSlug = string;

export type SfName = string;

export interface SfProductReviewCustom extends InferCustom<"normalizeProductReview"> {}

export interface SfProductReview {
  id: SfId;
  rating: number;
  title: string;
  comment: string;
  authorName: string;
  date: string;
  $custom?: SfProductReviewCustom;
}