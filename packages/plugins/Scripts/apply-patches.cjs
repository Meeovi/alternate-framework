#!/usr/bin/env node
// Root postinstall: apply packages/plugins/Patches/*.patch with
// patch-package — but only the patches whose target package is actually
// installed.
//
// Vercel (and `npm install` run from inside apps/ecosystem/<app>) installs
// just that one workspace's dependency tree, yet npm still runs this root
// postinstall. patch-package treats a patch for a package that isn't in
// node_modules as a hard error, so e.g. pixanomy-frontend's install failed
// on the instantsearch/react patches that only meeovi-frontend needs.
// Patches for packages that ARE installed still go through patch-package
// unchanged, so a patch that no longer applies still fails the install.
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const root = path.resolve(__dirname, '../../..')
const patchDir = 'packages/plugins/Patches'
const stagingDir = 'node_modules/.cache/applicable-patches'

// patch-package filenames: "<pkg>+<version>.patch", scoped "@scope+name+…",
// nested deps joined with "++" (outer++inner), optional ".dev" suffix.
function targetPath(file) {
  const base = file.replace(/(\.dev)?\.patch$/, '')
  const chain = base.split('++').map((chunk) => {
    const parts = chunk.split('+')
    parts.pop() // version (only present on the last chunk, harmless otherwise)
    return parts[0]?.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
  })
  return path.join(root, 'node_modules', ...chain.flatMap((name, i) => (i ? ['node_modules', name] : [name])))
}

const patches = fs.readdirSync(path.join(root, patchDir)).filter((f) => f.endsWith('.patch'))
const applicable = patches.filter((f) => fs.existsSync(path.join(targetPath(f), 'package.json')))
const skipped = patches.filter((f) => !applicable.includes(f))

for (const f of skipped) console.log(`[apply-patches] skipping ${f} (package not installed in this install)`)
if (!applicable.length) {
  console.log('[apply-patches] no applicable patches')
  process.exit(0)
}

// patch-package only takes a directory, so stage the applicable subset.
let dir = patchDir
if (skipped.length) {
  const staging = path.join(root, stagingDir)
  fs.rmSync(staging, { recursive: true, force: true })
  fs.mkdirSync(staging, { recursive: true })
  for (const f of applicable) fs.copyFileSync(path.join(root, patchDir, f), path.join(staging, f))
  dir = stagingDir
}

// A workspace-scoped install doesn't install the root's devDependencies, so
// patch-package itself may be missing — fall back to the root's pinned
// version via npx rather than failing.
let command, args
try {
  command = process.execPath
  args = [require.resolve('patch-package/index.js', { paths: [root] }), '--patch-dir', dir]
} catch {
  const version = require(path.join(root, 'package.json')).devDependencies?.['patch-package'] || 'latest'
  command = 'npx'
  args = ['--yes', `patch-package@${version}`, '--patch-dir', dir]
}
const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: command === 'npx' })
process.exit(result.status ?? 1)
