#!/usr/bin/env node
// Some transitive CJS dependencies (pulled in by instantsearch.js's search
// connectors, not imported directly by our own code) get requested by
// Vite's client dev server via absolute @fs/ paths that bypass its
// dependency optimizer. Without the optimizer's CJS-to-ESM conversion, the
// browser's native ESM loader fetches the raw CJS source (module.exports =
// ..., no `export` keyword anywhere) and throws "does not provide an
// export named 'default'" — the module genuinely has zero exports once
// parsed as ESM, regardless of whether module.exports is a static object
// or a computed value.
//
// Vite's client resolver natively prefers a package's "browser" field over
// "main" (its SSR resolver ignores "browser" and correctly keeps using the
// CJS "main" instead — exactly the split needed: fix the browser, leave
// Node/SSR alone). Each entry below points "browser" at a pre-built real
// ESM file, generated once via e.g.:
//   npx esbuild node_modules/<pkg>/<main> --bundle --format=esm
//     --platform=browser --outfile=layers/search/app/vendor/<pkg>.esm.js
// and copied into the package as esm-browser.mjs. patch-package (see
// patches/*.patch, run before this script from postinstall) captures that
// new file, but doesn't diff package.json changes — so the "browser" field
// itself is set here instead.
const fs = require('node:fs')
const path = require('node:path')

// Packages using the legacy top-level "browser" field (no "exports" map to
// compete with it).
const PACKAGES = ['algoliasearch-helper', 'qs', '@algolia/events', 'hogan.js']

// Packages that ship a modern "exports" map — when "exports" is present,
// Node/Vite's resolver uses it exclusively and ignores the legacy
// top-level "browser" field entirely, so the fix has to add a "browser"
// *condition* inside exports["."] instead (Vite's client resolver includes
// "browser" in its default conditions list, same as the field lookup).
const EXPORTS_MAP_PACKAGES = ['react']

for (const name of PACKAGES) {
  const pkgPath = path.join(__dirname, '..', 'node_modules', name, 'package.json')

  if (!fs.existsSync(pkgPath)) {
    console.warn(`[patch-browser-field-cjs-deps] ${name} not installed, skipping`)
    continue
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

  if (pkg.browser !== './esm-browser.mjs') {
    pkg.browser = './esm-browser.mjs'
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    console.log(`[patch-browser-field-cjs-deps] set "browser" field on ${name}/package.json`)
  }
}

for (const name of EXPORTS_MAP_PACKAGES) {
  const pkgPath = path.join(__dirname, '..', 'node_modules', name, 'package.json')

  if (!fs.existsSync(pkgPath)) {
    console.warn(`[patch-browser-field-cjs-deps] ${name} not installed, skipping`)
    continue
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const rootExport = pkg.exports && pkg.exports['.']

  if (rootExport && typeof rootExport === 'object' && rootExport.browser !== './esm-browser.mjs') {
    pkg.exports['.'] = { browser: './esm-browser.mjs', ...rootExport }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    console.log(`[patch-browser-field-cjs-deps] set exports["."].browser condition on ${name}/package.json`)
  }
}
