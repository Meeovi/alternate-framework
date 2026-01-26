import type { Simplify } from "type-fest";
import type { SfCategory } from "../models";

export interface GetCategoriesExtendedArgs {}
export interface GetCategoriesCustomArgs {}

export type GetCategoriesArgs = {
  ids?: string[];
  slugs?: string[];
  //$extended?: GetCategoriesExtendedArgs;
  //$custom?: GetCategoriesCustomArgs;
};

export type GetCategories = (args?: Simplify<GetCategoriesArgs>) => Promise<SfCategory[]>;

export interface GetCategoryExtendedArgs {}
export interface GetCategoryCustomArgs {}
export type GetCategoryArgs = {
  id: string;
  //$extended?: GetCategoryExtendedArgs;
  //$custom?: GetCategoryCustomArgs;
};

export type GetCategory = (args: Simplify<GetCategoryArgs>) => Promise<{
  ancestors: SfCategory[];
  category: SfCategory;
}>;
