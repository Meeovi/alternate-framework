#!/usr/bin/env node
// Container builds start from a clean clone, where the generated .nuxt/ folders don't exist.
// Several tsconfig.json files extend one (layers/shared extends the repo-root .nuxt/tsconfig.json,
// search/business extend .playground/.nuxt/tsconfig.json), and Vite's transform stops with
// "Tsconfig not found" when the extends target is missing. Locally a past `nuxt prepare` left
// those files behind, which hides the problem. This writes an empty `{}` at every missing target.
'use strict'

const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(process.argv[2] || '.')
const skip = new Set(['node_modules', '.git', '.output', 'dist'])

function* tsconfigs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* tsconfigs(full)
    else if (/^tsconfig.*\.json$/.test(entry.name)) yield full
  }
}

for (const file of tsconfigs(root)) {
  // tsconfig files are JSONC, so read "extends" with a regex instead of JSON.parse.
  const match = fs.readFileSync(file, 'utf8').match(/"extends"\s*:\s*(\[[^\]]*\]|"[^"]*")/)
  if (!match) continue
  for (const [, target] of match[1].matchAll(/"([^"]+)"/g)) {
    if (!target.startsWith('.')) continue // package names resolve through node_modules
    const resolved = path.resolve(path.dirname(file), target)
    if (fs.existsSync(resolved)) continue
    fs.mkdirSync(path.dirname(resolved), { recursive: true })
    fs.writeFileSync(resolved, '{}\n')
    console.log(`stub ${path.relative(root, resolved)} (extended by ${path.relative(root, file)})`)
  }
}
