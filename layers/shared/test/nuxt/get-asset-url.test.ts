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

  it('prefers the file id over filename_download/filename, since Directus only serves /assets/<id>', async () => {
    const { getAssetURL } = await import('../../app/utils/get-asset-url')
    const config = useRuntimeConfig()
    expect(getAssetURL({ filename_download: 'a.png', filename: 'b.png', id: 'c' })).toBe(
      `${config.public.directusUrl}/assets/c`,
    )
    expect(getAssetURL({ filename_download: 'a.png', filename: 'b.png' })).toBe(
      `${config.public.directusUrl}/assets/a.png`,
    )
    expect(getAssetURL({ filename: 'b.png' })).toBe(`${config.public.directusUrl}/assets/b.png`)
  })

  it('unwraps an M2M files junction row instead of using its integer id', async () => {
    const { getAssetURL } = await import('../../app/utils/get-asset-url')
    const config = useRuntimeConfig()
    expect(getAssetURL({ id: 8, page_blocks_id: 5, directus_files_id: { id: 'f-uuid', filename_download: 'logo.png' } }))
      .toBe(`${config.public.directusUrl}/assets/f-uuid`)
    expect(getAssetURL({ id: 8, directus_files_id: 'f-uuid' })).toBe(`${config.public.directusUrl}/assets/f-uuid`)
  })

  it('passes through a full URL held in a filename field', async () => {
    const { getAssetURL } = await import('../../app/utils/get-asset-url')
    expect(getAssetURL({ id: 'x', filename: 'https://cdn.bsky.app/img/a.jpg' })).toBe('https://cdn.bsky.app/img/a.jpg')
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
