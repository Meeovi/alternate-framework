export interface SfBlock {
  id: string;
  title: string;
  identifier: string;
  content: string;
  isActive: boolean;
  sortOrder: number;
  storeIds: string[];
  createdAt: string;
  updatedAt: string;
  extensionAttributes?: Record<string, unknown>;
}

export interface SfPage {
  id: string;
  title: string;
  identifier: string;
  content: string;
  contentHeading: string;
  pageLayout: string;
  layoutUpdateXml?: string;
  customTheme: string;
  customRootTemplate: string;
  customLayoutUpdateXml: string;
  metaKeywords: string;
  metaDescription: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: number;
  path: string;
  websiteIds: string[];
  storeIds: string[];
  createdAt: string;
  updatedAt: string;
  extensionAttributes?: Record<string, unknown>;
}
