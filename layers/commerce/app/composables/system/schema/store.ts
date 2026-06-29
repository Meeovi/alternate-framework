export interface SfStore {
  id: string;
  name: string;
  code: string;
  websiteId: string;
  groupId: string;
  rootCategoryId: string;
  defaultStoreGroupId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SfWebsite {
  id: string;
  name: string;
  code: string;
  sortOrder: number;
  defaultGroupId: string;
  isDefault: boolean;
  extensionAttributes?: Record<string, unknown>;
}

export interface SfStoreGroup {
  id: string;
  name: string;
  code: string;
  websiteId: string;
  rootCategoryId: string;
  defaultStoreId: string;
}

export interface SfStoreView {
  id: string;
  name: string;
  code: string;
  storeId: string;
  websiteId: string;
  locale: string;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
  extensionAttributes?: Record<string, unknown>;
}
