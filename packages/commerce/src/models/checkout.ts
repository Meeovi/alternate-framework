import type { InferCustom } from "../defs";
import type { Maybe, SfMoney } from "./shared";

export interface SfShippingMethodCustom extends InferCustom<"normalizeCartCoupon"> {}

export interface SfShippingMethod {
  description: Maybe<string>;
  estimatedDelivery: Maybe<string>;
  id: string;
  name: string;
  price: SfMoney;
  $custom?: SfShippingMethodCustom;
}

export interface SfShippingMethods {
  methods: SfShippingMethod[];
}
