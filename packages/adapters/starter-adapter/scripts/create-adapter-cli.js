#!/usr/bin/env node
const fs = require('fs').promises
const path = require('path')
const readline = require('readline/promises')
const { stdin: input, stdout: output } = require('process')

const AVAILABLE_LAYERS = ['auth', 'commerce', 'search', 'social', 'chat', 'analytics']

async function copyAndReplace(src, dest, replacements) {
  const stat = await fs.stat(src)
  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true })
    const items = await fs.readdir(src)
    for (const item of items) {
      await copyAndReplace(path.join(src, item), path.join(dest, item), replacements)
    }
  } else {
    let content = await fs.readFile(src, 'utf8')
    for (const [k, v] of Object.entries(replacements)) {
      content = content.split(k).join(v)
    }
    await fs.writeFile(dest, content, 'utf8')
  }
}

function toPascalCase(s) {
  return s.replace(/(^.|-.)/g, (m) => m.replace(/-/,'').toUpperCase())
}

async function run() {
  const rl = readline.createInterface({ input, output })

  try {
    // If CLI options were provided, use them and skip prompts
    const argv = process.argv.slice(2)

    function parseArgs(argv) {
      const out = {}
      for (let i = 0; i < argv.length; i++) {
        const a = argv[i]
        if (a === '--name' || a === '-n') out.name = argv[++i]
        else if (a === '--desc' || a === '-d') out.desc = argv[++i]
        else if (a === '--layers' || a === '-l') out.layers = argv[++i]
        else if (a === '--dest') out.dest = argv[++i]
      }
      return out
    }

    const cli = parseArgs(argv)

    let shortNameRaw
    if (cli.name) {
      shortNameRaw = String(cli.name).trim()
      if (!shortNameRaw) {
        console.error('Name is required')
        process.exit(1)
      }
    } else {
      shortNameRaw = (await rl.question('Adapter short name (e.g. shop): ')).trim()
      if (!shortNameRaw) {
        console.error('Name is required')
        process.exit(1)
      }
    }

    const shortName = shortNameRaw.replace(/^adapter-/, '').toLowerCase().replace(/[^a-z0-9-]/g, '-')

    let description
    if (cli.desc !== undefined) description = String(cli.desc).trim()
    else description = (await rl.question('Description (optional): ')).trim()

    let selected
    if (cli.layers) {
      selected = String(cli.layers)
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
    } else {
      console.log(`Available layers: ${AVAILABLE_LAYERS.join(', ')}`)
      const layersRaw = (await rl.question('Select layers (comma-separated): ')).trim()
      selected = layersRaw
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
    }

    // validate
    const invalid = selected.filter(s => !AVAILABLE_LAYERS.includes(s))
    if (invalid.length) {
      console.error('Invalid layers:', invalid.join(', '))
      process.exit(1)
    }

    const packageName = `@meeovi/adapter-${shortName}`
    const dest = cli.dest ? path.resolve(cli.dest) : path.resolve(__dirname, '..', '..', `adapter-${shortName}`)
    const templateDir = path.resolve(__dirname, '..', 'template')

    // ensure dest does not exist
    await fs.stat(dest).then(() => {
      throw new Error(`Destination ${dest} already exists`)
    }).catch(err => {
      if (err && err.code !== 'ENOENT') throw err
    })

    const replacements = {
      '__PACKAGE_NAME__': packageName,
      '__SHORT_NAME__': shortName
    }

    await copyAndReplace(templateDir, dest, replacements)

    // update package.json description and name
    const pkgPath = path.join(dest, 'package.json')
    const pkgText = await fs.readFile(pkgPath, 'utf8')
    const pkg = JSON.parse(pkgText)
    pkg.name = packageName
    if (description) pkg.description = description
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2), 'utf8')

    // ensure src dir exists
    const srcDir = path.join(dest, 'src')
    await fs.mkdir(srcDir, { recursive: true })

    // create stubs for layers not in template
    for (const layer of selected) {
      const filePath = path.join(srcDir, `${layer}.ts`)
      try {
        await fs.stat(filePath)
        // exists — leave it
      } catch (err) {
        // create a generic stub
        const fnName = 'create' + toPascalCase(layer) + 'Adapter'
        const content = `import type { TransportAdapter } from '@meeovi/sdk'\nimport type { Result } from '@meeovi/core'\n\nexport const ${fnName} = (transport: TransportAdapter) => ({\n  // TODO: implement ${layer} adapter methods\n  // Example:\n  // async example(): Promise<Result<any>> { return { ok: false, error: 'Not implemented' } }\n})\n`
        await fs.writeFile(filePath, content, 'utf8')
      }
    }

    // generate index.ts according to selected layers
    const settersMap = {
      auth: { set: 'setAuthAdapter', fn: 'createAuthAdapter', import: './src/auth' },
      commerce: { set: 'setCommerceAdapter', fn: 'createCommerceAdapter', import: './src/commerce' },
      search: { set: 'setSearchAdapter', fn: 'createSearchAdapter', import: './src/search' },
      social: { set: 'setSocialAdapter', fn: 'createSocialAdapter', import: './src/social' },
      chat: { set: 'setChatAdapter', fn: 'createChatAdapter', import: './src/chat' },
      analytics: { set: 'setAnalyticsAdapter', fn: 'createAnalyticsAdapter', import: './src/analytics' }
    }

    const imports = new Set()
    const creators = []
    const setters = []

    imports.add("import { createTransport } from './src/transport'")
    for (const layer of selected) {
      const map = settersMap[layer]
      if (!map) continue
      imports.add(`import { ${map.fn} } from '${map.import}'`)
      creators.push(map.fn)
      setters.push(map.set)
    }

    const sdkSetters = setters.length ? `import { ${Array.from(new Set(setters)).join(', ')} } from '@meeovi/sdk'` : ''

    let indexContent = ''
    if (sdkSetters) indexContent += sdkSetters + '\n\n'
    indexContent += Array.from(imports).join('\n') + '\n\n'
    indexContent += `export const installAdapter = (config: { baseUrl: string; apiKey?: string }) => {\n  const transport = createTransport(config)\n\n`
    for (const layer of selected) {
      const map = settersMap[layer]
      if (!map) continue
      indexContent += `  ${map.set}(${map.fn}(transport))\n`
    }
    indexContent += '}\n'

    await fs.writeFile(path.join(dest, 'index.ts'), indexContent, 'utf8')

    console.log(`Adapter scaffolded to ${dest}`)
    console.log('Next steps:')
    console.log(`  cd ${dest}`)
    console.log('  npm install')
    console.log('  npm run build')
    rl.close()
  } catch (err) {
    console.error('Error:', err.message || err)
    process.exit(1)
  }
}

run()
