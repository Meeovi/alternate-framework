import process from 'node:process'
import fs from 'fs-extra'
import path from 'node:path'
import { createRequire } from 'node:module'
import { emojiPrefix, iconifyEmojiPackage } from '../config/emojis.ts'
import { colorsMap } from './generate-themes.ts'

const dereference = process.platform === 'win32' ? true : undefined

const require = createRequire(import.meta.url)
let iconsSrc = `node_modules/${iconifyEmojiPackage}/icons`
try {
	const pkgJsonPath = require.resolve(`${iconifyEmojiPackage}/package.json`)
	const pkgDir = path.dirname(pkgJsonPath)
	iconsSrc = path.join(pkgDir, 'icons')
} catch (e) {
	// fallback to node_modules path
}

await fs.copy(iconsSrc, `public/emojis/${emojiPrefix}`, { overwrite: true, dereference })

await fs.ensureDir('app/constants')
await fs.ensureDir('app/styles')
await fs.writeJSON('app/constants/themes.json', colorsMap, { spaces: 2, EOL: '\n' })
await fs.writeFile('app/styles/default-theme.css', `:root {\n${Object.entries(colorsMap[0][1]).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}\n`, { encoding: 'utf-8' })
