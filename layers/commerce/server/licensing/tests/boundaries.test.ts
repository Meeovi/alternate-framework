import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(__dirname, '..')
const sourceFiles = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name)
  if (statSync(path).isDirectory()) return name === 'tests' ? [] : sourceFiles(path)
  return path.endsWith('.ts') && name !== 'vitest.config.ts' ? [path] : []
})
const imports = (file: string) => [...readFileSync(file, 'utf8').matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1] ?? m[2]).filter((s): s is string => !!s)

describe('module boundaries', () => {
  const files = sourceFiles(root)

  it('has source files to check', () => {
    expect(files.length).toBeGreaterThan(5)
  })

  it('imports only its own files (no commerce, auth, storage, CMS, chat or framework dependency)', () => {
    const external = files.flatMap((f) => imports(f).filter((s) => !s.startsWith('./')).map((s) => `${relative(root, f)} → ${s}`))
    expect(external).toEqual([])
  })

  it('never names Magento, Webkul, Directus or Rocket.Chat in code', () => {
    const named = files.filter((f) => /magento|webkul|directus|rocket\.?chat/i.test(readFileSync(f, 'utf8').replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, '')))
    expect(named.map((f) => relative(root, f))).toEqual([])
  })
})
