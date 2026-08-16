import { describe, it, expect } from 'vitest'
import { transformUrlToIframeSrc, generateVideoEmbed } from '../../app/utils/embed'

describe('transformUrlToIframeSrc', () => {
  it('rewrites a YouTube watch URL to an embed URL', () => {
    expect(transformUrlToIframeSrc('https://www.youtube.com/watch?v=abc123')).toBe(
      'https://www.youtube.com/embed/abc123',
    )
  })

  it('rewrites a Vimeo URL to a player URL', () => {
    expect(transformUrlToIframeSrc('https://vimeo.com/12345')).toBe('https://player.vimeo.com/video/12345')
  })

  it('rewrites a Loom share URL to an embed URL', () => {
    expect(transformUrlToIframeSrc('https://www.loom.com/share/xyz')).toBe('https://www.loom.com/embed/xyz')
  })

  it('rewrites a Google Drive file URL to a preview URL', () => {
    expect(transformUrlToIframeSrc('https://drive.google.com/file/d/abc/view')).toBe(
      'https://drive.google.com/file/d/abc/preview',
    )
  })

  it('returns the URL unchanged when no transformation matches', () => {
    expect(transformUrlToIframeSrc('https://example.com/page')).toBe('https://example.com/page')
  })
})

describe('generateVideoEmbed', () => {
  it('handles youtube.com watch URLs', () => {
    expect(generateVideoEmbed('https://www.youtube.com/watch?v=abc123')).toBe(
      'https://www.youtube.com/embed/abc123',
    )
  })

  it('handles youtu.be short links', () => {
    expect(generateVideoEmbed('https://youtu.be/abc123')).toBe('https://www.youtube.com/embed/abc123')
  })

  it('handles vimeo.com URLs', () => {
    expect(generateVideoEmbed('https://vimeo.com/12345')).toBe('https://player.vimeo.com/video/12345')
  })

  it('handles loom.com share URLs', () => {
    expect(generateVideoEmbed('https://www.loom.com/share/xyz')).toBe('https://www.loom.com/embed/xyz')
  })

  it('returns the URL unchanged for an unrecognized host', () => {
    expect(generateVideoEmbed('https://example.com/video')).toBe('https://example.com/video')
  })
})
