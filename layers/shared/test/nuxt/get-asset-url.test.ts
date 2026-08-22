import { describe, it, expect } from 'vitest'

// Moved from test/unit/get-asset-url.spec.ts: getAssetURL reads
// useRuntimeConfig().public.directusUrl, which only resolves inside a real
// Nuxt context — the old unit-project version asserted against
// `import.meta.env.DIRECTUS_URL` (always undefined outside Nuxt), which
// masked the real bug (see layers/shared/nuxt.config.ts's directusUrl entry
// and layers/shared/app/utils/get-asset-url.ts) since both sides of the
// assertion were undefined and always matched.
describe('getAssetURL', () => {
  it('returns null for nullish input', async () => {
    const { getAssetURL } = await import('../../app/utils/get-asset-url')
    expect(getAssetURL(undefined)).toBeNull()
    expect(getAssetURL(null)).toBeNull()
  })

  it('builds an asset URL from a plain string id using the real configured Directus URL', async () => {
    const { getAssetURL } = await import('../../app/utils/get-asset-url')
    const config = useRuntimeConfig()
    expect(config.public.directusUrl).toBeTruthy()
    expect(getAssetURL('abc-123')).toBe(`${config.public.directusUrl}/assets/abc-123`)
  })

  it('prefers filename_download, then filename, then id, from an object', async () => {
    const { getAssetURL } = await import('../../app/utils/get-asset-url')
    const config = useRuntimeConfig()
    expect(getAssetURL({ filename_download: 'a.png', filename: 'b.png', id: 'c' })).toBe(
      `${config.public.directusUrl}/assets/a.png`,
    )
    expect(getAssetURL({ filename: 'b.png', id: 'c' })).toBe(`${config.public.directusUrl}/assets/b.png`)
    expect(getAssetURL({ id: 'c' })).toBe(`${config.public.directusUrl}/assets/c`)
  })

  it('returns null for an object with none of the expected fields', async () => {
    const { getAssetURL } = await import('../../app/utils/get-asset-url')
    expect(getAssetURL({ foo: 'bar' })).toBeNull()
  })
})

describe('hasAsset', () => {
  it('mirrors getAssetURL as a boolean', async () => {
    const { hasAsset } = await import('../../app/utils/get-asset-url')
    expect(hasAsset('abc')).toBe(true)
    expect(hasAsset(undefined)).toBe(false)
  })
})
