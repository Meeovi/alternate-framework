import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('runtime entry boundary', () => {
  it('does not export Nuxt module APIs from runtime source entry', () => {
    const sourceEntry = readFileSync(resolve(process.cwd(), 'src/index.ts'), 'utf8')

    expect(sourceEntry).not.toContain("from './module'")
    expect(sourceEntry).not.toContain('nuxtModule')
  })

  it('does not import @nuxt/kit in built runtime entry', () => {
    const distEntryPath = resolve(process.cwd(), 'dist/index.mjs')

    if (!existsSync(distEntryPath)) {
      return
    }

    const distEntry = readFileSync(distEntryPath, 'utf8')

    expect(distEntry).not.toContain('@nuxt/kit')
    expect(distEntry).not.toContain('defineNuxtModule')
  })
})
