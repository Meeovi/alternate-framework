import { createDirectus, rest } from '@directus/sdk'

export const directus = createDirectus('')

export function createMeeoviDirectusClient<Schema = any>(url: string) {
  return createDirectus<Schema>(url).with(rest())
}