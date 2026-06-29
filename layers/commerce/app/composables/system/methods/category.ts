import type { Simplify } from '../defs/typeHelpers';
import type { SfCategory, SfCategoryTree } from "../models";

export interface GetCategoriesExtendedArgs {}
export interface GetCategoriesCustomArgs {}

export interface GetCategoriesFilters {
  ids?: string[];
  slugs?: string[];
  parentId?: string;
  levels?: number[];
  isActive?: boolean;
}

export type GetCategoriesArgs = {
  filters?: GetCategoriesFilters;
  pageSize?: number;
  currentPage?: number;
  //$extended?: GetCategoriesExtendedArgs;
  //$custom?: GetCategoriesCustomArgs;
};

export type GetCategories = (args?: Simplify<GetCategoriesArgs>) => Promise<{
  categories: SfCategory[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalResults: number;
  };
  tree?: SfCategoryTree[];
}>;

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

export interface GetCategoryTreeExtendedArgs {}
export interface GetCategoryTreeCustomArgs {}

export type GetCategoryTreeArgs = {
  rootCategoryId?: string;
  maxDepth?: number;
  //$extended?: GetCategoryTreeExtendedArgs;
  //$custom?: GetCategoryTreeCustomArgs;
};

export type GetCategoryTree = (args?: Simplify<GetCategoryTreeArgs>) => Promise<{
  tree: SfCategoryTree[];
}>;

export interface GetCategoryProductsExtendedArgs {}
export interface GetCategoryProductsCustomArgs {}

export type GetCategoryProductsArgs = {
  categoryId: string;
  pageSize?: number;
  currentPage?: number;
  filters?: {
    priceFrom?: number;
    priceTo?: number;
    inStock?: boolean;
    newProducts?: boolean;
    saleProducts?: boolean;
  };
  sort?: {
    field: string;
    direction: 'ASC' | 'DESC';
  };
  //$extended?: GetCategoryProductsExtendedArgs;
  //$custom?: GetCategoryProductsCustomArgs;
};

export type GetCategoryProducts = (args: Simplify<GetCategoryProductsArgs>) => Promise<{
  items: import("../models/product").SfProductCatalogItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalResults: number;
  };
  aggregations?: Array<{
    field: string;
    label: string;
    displayMode: string;
    options: Array<{
      value: string;
      label: string;
      count: number;
      isSelected: boolean;
    }>;
  }>;
}>;

export interface CreateCategoryExtendedArgs {}
export interface CreateCategoryCustomArgs {}

export type CreateCategoryArgs = {
  name: string;
  slug: string;
  parentId?: string;
  position?: number;
  isActive?: boolean;
  description?: string;
  image?: {
    url: string;
    alt?: string;
  };
  //$extended?: CreateCategoryExtendedArgs;
  //$custom?: CreateCategoryCustomArgs;
};

export type CreateCategory = (args: Simplify<CreateCategoryArgs>) => Promise<SfCategory>;

export interface UpdateCategoryExtendedArgs {}
export interface UpdateCategoryCustomArgs {}

export type UpdateCategoryArgs = {
  id: string;
  name?: string;
  slug?: string;
  parentId?: string;
  position?: number;
  isActive?: boolean;
  description?: string;
  image?: {
    url?: string;
    alt?: string;
  };
  //$extended?: UpdateCategoryExtendedArgs;
  //$custom?: UpdateCategoryCustomArgs;
};

export type UpdateCategory = (args: Simplify<UpdateCategoryArgs>) => Promise<SfCategory>;

export interface DeleteCategoryExtendedArgs {}
export interface DeleteCategoryCustomArgs {}

export type DeleteCategoryArgs = {
  id: string;
  moveChildrenToParent?: boolean;
  //$extended?: DeleteCategoryExtendedArgs;
  //$custom?: DeleteCategoryCustomArgs;
};

export type DeleteCategory = (args: Simplify<DeleteCategoryArgs>) => Promise<boolean>;
