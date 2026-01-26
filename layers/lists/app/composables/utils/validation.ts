import type { List, ListItem } from '../types'

export function validateListInput(data: Partial<List>) {
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('List title is required and must be a string')
  }

  if (data.type && typeof data.type !== 'string') {
    throw new Error('List type must be a string')
  }
}

export function validateItemInput(data: Partial<ListItem>) {
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Item title is required and must be a string')
  }

  if (data.completed !== undefined && typeof data.completed !== 'boolean') {
    throw new Error('Item completed must be a boolean')
  }
}