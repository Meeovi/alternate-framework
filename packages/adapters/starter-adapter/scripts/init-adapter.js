#!/usr/bin/env node
const fs = require('fs').promises
const path = require('path')

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

async function run() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Usage: init-adapter.js <short-name> [dest]')
    process.exit(1)
  }

  const shortName = args[0].replace(/^adapter-/, '')
  const packageName = `@meeovi/adapter-${shortName}`
  const defaultDest = path.join(__dirname, '..', `adapter-${shortName}`)
  const dest = args[1] ? path.resolve(args[1]) : path.resolve(defaultDest)

  // template dir
  const templateDir = path.join(__dirname, '..', 'template')

  try {
    // ensure destination does not already exist
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

    console.log(`Adapter scaffolded to ${dest}`)
    console.log('Next steps:')
    console.log(`  cd ${dest}`)
    console.log('  npm install')
    console.log('  npm run build')
  } catch (err) {
    console.error('Error:', err.message || err)
    process.exit(1)
  }
}

run()
