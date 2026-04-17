export * from "./src/index";

import { createItem, readFieldsByCollection, readItem } from "@directus/sdk";
import { directusGatewayClient } from "./utils/client";
import { handleDirectusError } from "./utils/errors";
import { normalizeDirectusPayload } from "./utils/normalizers";
import type { DirectusGatewayAdapterContract } from "./types";

function normalizeDirectusLegacyResult(value: any): any {
  if (Array.isArray(value)) return value.map(normalizeDirectusLegacyResult)
  if (!value || typeof value !== 'object') return value
  const normalized: Record<string, any> = {}
  for (const [key, entry] of Object.entries(value)) {
    normalized[key] = normalizeDirectusLegacyResult(entry)
  }
  if (normalized.directus_files_id && !normalized.file) {
    normalized.file = normalized.directus_files_id
  }
  return normalized
}

function expandDirectusLegacyFields(value: any): any {
  if (Array.isArray(value)) {
    return value.flatMap((entry: any) => {
      const expanded = expandDirectusLegacyFields(entry)
      return Array.isArray(expanded) ? expanded : [expanded]
    })
  }
  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' && value.includes('file')) {
      const legacyValue = value.replace(/(^|\.)file(\.|$)/g, '$1directus_files_id$2')
      return legacyValue === value ? value : [value, legacyValue]
    }
    return value
  }
  const normalized: Record<string, any> = {}
  for (const [key, entry] of Object.entries(value)) {
    const nextKey = key === 'file' ? 'directus_files_id' : key
    normalized[nextKey] = expandDirectusLegacyFields(entry)
  }
  return normalized
}

function normalizeDirectusLegacyPayload(data: any): any {
  if (Array.isArray(data)) return data.map(normalizeDirectusLegacyPayload)
  if (!data || typeof data !== 'object') return data
  const normalized: Record<string, any> = {}
  for (const [key, entry] of Object.entries(data)) {
    const nextKey = key === 'file' ? 'directus_files_id' : key
    normalized[nextKey] = normalizeDirectusLegacyPayload(entry)
  }
  return normalized
}

export function normalizeDirectusReadOptions(opts: any) {
  if (!opts) return opts
  return expandDirectusLegacyFields(opts)
}

export function normalizeDirectusWritePayload(payload: any) {
  return normalizeDirectusLegacyPayload(payload)
}

export function normalizeDirectusResult(result: any) {
  return normalizeDirectusLegacyResult(result)
}

export class DirectusAdapter implements DirectusGatewayAdapterContract {
  async getSchema(collection: string): Promise<unknown> {
    try {
      const payload = await directusGatewayClient.request(readFieldsByCollection(collection));
      return normalizeDirectusPayload(payload);
    } catch (error) {
      handleDirectusError(error);
    }
  }

  async getItem(collection: string, id: string): Promise<unknown> {
    try {
      const payload = await directusGatewayClient.request(readItem(collection as any, id));
      return normalizeDirectusPayload(payload);
    } catch (error) {
      handleDirectusError(error);
    }
  }

  async createItem(collection: string, input: Record<string, unknown>): Promise<unknown> {
    try {
      const payload = await directusGatewayClient.request(createItem(collection as any, input));
      return normalizeDirectusPayload(payload);
    } catch (error) {
      handleDirectusError(error);
    }
  }
}

export interface DescribeDirectusContentErrorOptions {
  label?: string
  directusUrl?: string
}

export function describeDirectusContentError(error: any, options: DescribeDirectusContentErrorOptions = {}) {
  const label = options.label || 'content'
  const message = String(error?.data?.message || error?.statusMessage || error?.message || '').trim()

  if (/503|service unavailable/i.test(message)) {
    const host = options.directusUrl || 'Directus'
    return `Directus content is currently unavailable from ${host}.`
  }

  if (message) {
    return `Unable to load ${label}: ${message}`
  }

  return `Unable to load ${label} from Directus.`
}

export const createGatewayAdapterBindings = () => ({
  content: {
    directus: new DirectusAdapter()
  }
});