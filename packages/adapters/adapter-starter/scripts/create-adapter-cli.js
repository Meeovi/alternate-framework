#!/usr/bin/env node
const fs = require('fs').promises
const path = require('path')
const readline = require('readline/promises')
const { stdin: input, stdout: output } = require('process')

const AVAILABLE_LAYERS = ['auth', 'commerce', 'search']

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

    const packageName = `@mframework/adapter-${shortName}`
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
        const content = `// TODO: Replace with types from shared contracts if needed\n\nexport const ${fnName} = (transport) => ({\n  // TODO: implement ${layer} adapter methods\n  // Example:\n  // async example() { return { ok: false, error: 'Not implemented' } }\n})\n`
        await fs.writeFile(filePath, content, 'utf8')
      }
    }

    // generate index.ts according to selected layers
    const settersMap = {
      auth: { fn: 'createAuthAdapter', import: './src/auth' },
      commerce: { fn: 'createCommerceAdapter', import: './src/commerce' },
      search: { fn: 'createSearchAdapter', import: './src/search' }
    }

    const imports = new Set()
    const layerFactoryEntries = []

    imports.add("import { createTransport } from './src/transport'")
    imports.add("import { createAdapterInstaller, defineAdapterLayerFactories } from './src/patterns'")
    for (const layer of selected) {
      const map = settersMap[layer]
      if (!map) continue
      imports.add(`import { ${map.fn} } from '${map.import}'`)
      layerFactoryEntries.push(`  ${layer}: ${map.fn}`)
    }

    let indexContent = ''
    indexContent += Array.from(imports).join('\n') + '\n\n'
    indexContent += 'const layerFactories = defineAdapterLayerFactories({\n'
    indexContent += `${layerFactoryEntries.join(',\n')}\n`
    indexContent += '})\n\n'
    indexContent += 'export const installAdapter = createAdapterInstaller(createTransport, layerFactories)\n'

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
