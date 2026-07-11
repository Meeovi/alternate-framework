import { defineEventHandler } from "#build/types/nitro-imports"

export default defineEventHandler(async (event) => {
  return { status: 'ok', adapter: 'directus' }
})
