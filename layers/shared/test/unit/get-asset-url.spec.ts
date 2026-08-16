import { describe, it, expect } from 'vitest'
import { getAssetURL, hasAsset } from '../../app/utils/get-asset-url'

describe('getAssetURL', () => {
  it('returns null for nullish input', () => {
    expect(getAssetURL(undefined)).toBeNull()
    expect(getAssetURL(null)).toBeNull()
  })

  it('builds an asset URL from a plain string id', () => {
    expect(getAssetURL('abc-123')).toBe(`${import.meta.env.DIRECTUS_URL}/assets/abc-123`)
  })

  it('prefers filename_download, then filename, then id, from an object', () => {
    expect(getAssetURL({ filename_download: 'a.png', filename: 'b.png', id: 'c' })).toBe(
      `${import.meta.env.DIRECTUS_URL}/assets/a.png`,
    )
    expect(getAssetURL({ filename: 'b.png', id: 'c' })).toBe(`${import.meta.env.DIRECTUS_URL}/assets/b.png`)
    expect(getAssetURL({ id: 'c' })).toBe(`${import.meta.env.DIRECTUS_URL}/assets/c`)
  })

  it('returns null for an object with none of the expected fields', () => {
    expect(getAssetURL({ foo: 'bar' })).toBeNull()
  })
})

describe('hasAsset', () => {
  it('mirrors getAssetURL as a boolean', () => {
    expect(hasAsset('abc')).toBe(true)
    expect(hasAsset(undefined)).toBe(false)
  })
})
