#!/usr/bin/env node
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const args = process.argv.slice(2)

// Try workspace-local starter-adapter CLI first
const localCli = path.resolve(__dirname, '..', '..', 'adapters', 'starter-adapter', 'scripts', 'create-adapter-cli.cjs')

if (fs.existsSync(localCli)) {
  const child = spawn(process.execPath, [localCli, ...args], { stdio: 'inherit' })
  child.on('exit', code => process.exit(code))
} else {
  // Fallback to npx to fetch runner from npm
  const child = spawn('npx', ['@meeovi/adapter-starter', ...args], { stdio: 'inherit' })
  child.on('exit', code => process.exit(code))
}
