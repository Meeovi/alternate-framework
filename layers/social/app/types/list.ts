export interface List {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isPublic?: boolean;
  type: 'default' | 'wishlist' | 'bookmark' | 'custom';
  category?: string;
  color?: string;
  colorText?: string;
  items: Array<any>;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface ListItem {
  id: string;
  content: string;
  position: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export function noramilzeListRecord (record: any): ListItem {
  if (!record) {
    throw new Error('Record is required');
  }
  
  return {
    id: record.id,
    content: record.content,
    position: record.position,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}