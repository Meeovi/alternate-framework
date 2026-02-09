#!/usr/bin/env node
const { spawnSync } = require('child_process')
const { readFileSync, existsSync } = require('fs')
const path = require('path')

// Load root .env into process.env (simple parser)
const envPath = path.resolve(process.cwd(), '.env')
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1)
    // remove surrounding quotes
    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (typeof process.env[key] === 'undefined') process.env[key] = val
  }
}

// Build prisma args: pass through CLI args and ensure schema points to package schema
const args = process.argv.slice(2)
const schemaPath = path.join('packages', 'modules', 'api', 'prisma', 'schema.prisma')
// Determine the prisma command (first non-flag arg). Only append `--schema` for commands that use schema.
const cmd = args.find(a => !a.startsWith('-'))
const commandsUsingSchema = new Set(['db', 'migrate', 'generate', 'validate', 'format', 'studio', 'introspect', 'push', 'pull'])
const hasSchema = args.some(a => a === '--schema' || a.startsWith('--schema='))
if (!hasSchema && cmd && commandsUsingSchema.has(cmd)) {
  args.push('--schema=' + schemaPath)
}

// Run `npx prisma` with forwarded args
const res = spawnSync('npx', ['prisma', ...args], { stdio: 'inherit', env: process.env })
process.exit(res.status === null ? 1 : res.status)
