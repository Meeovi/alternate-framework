export interface SfProductType {
  id: string;
  name: string;
  entityTypeId: string;
  code?: string;
  weight?: number;
  isRequireOptions: boolean;
  priceModel?: string;
  indexPriority?: number;
  defaultAttributeSetId?: string;
  taxClassId?: string;
  isVirtual?: boolean;
  extensionAttributes?: Record<string, unknown>;
}
