import type { DirectusField } from '../schema/types';
import { readItems } from '@directus/sdk';

export interface TableColumn {
  key: string;
  label: string;
  type: string;
  sortable?: boolean;
  hidden?: boolean;
}

export function generateTableSchema(fields: DirectusField[]): TableColumn[] {
  return fields
    .filter((f) => !f.hidden)
    .map((f) => ({
      key: f.field,
      label: prettifyLabel(f.field),
      type: f.type,
      sortable: true,
      hidden: false
    }));
}

function prettifyLabel(str: string): string {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function fetchTableRows(
  directus: any,
  collection: string
): Promise<any[]> {
  return await directus.request(
    readItems(collection)
  );
}
