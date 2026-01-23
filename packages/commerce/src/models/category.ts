import type { InferCustom } from "../defs";
import type { Maybe, SfId } from "./shared";

export interface SfCategoryCustom extends InferCustom<"normalizeCartCoupon"> {}

export interface SfCategory {
  id: SfId;
  name: string;
  slug: string;
  subcategories: Maybe<SfCategory[]>;
  parentCategoryId: Maybe<SfId>;
  $custom?: SfCategoryCustom;
}
