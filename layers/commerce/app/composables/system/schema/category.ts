import type { SfProduct } from "./product";

export interface SfCategory {
  id: string;
  parentId: number;
  name: string;
  isActive: boolean;
  position: number;
  level: number;
  childrenCount: number;
  path: string;
  createdAt: string;
  updatedAt: string;
  createdAtSql?: string;
  updatedAtSql?: string;
  // Additional relations omitted
}

export interface SfCategoryProductLink {
  categoryId: string;
  productId: string;
  position: number;
}

export interface SfCategoryTree {
  id: string;
  name: string;
  parentId: number;
  isActive: boolean;
  position: number;
  level: number;
  childrenCount: number;
  path: string;
  children?: SfCategoryTree[];
}
