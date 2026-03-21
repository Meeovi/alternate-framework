#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT_DIR = process.cwd()
const SOURCE_ROOTS = ['apps', 'layers']
const SERVER_ROOTS = ['apps', 'layers']
const IGNORE_DIRS = new Set(['node_modules', '.git', '.nuxt', '.output', 'dist', 'build', '.turbo', 'coverage'])
const CODE_EXTENSIONS = new Set(['.ts', '.js', '.mjs', '.cjs', '.vue'])

const allowlistPath = path.join(ROOT_DIR, 'scripts', 'invariant-allowlist.json')

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/')
}

function isIgnoredPath(filePath) {
  const parts = toPosixPath(filePath).split('/')
  return parts.some((part) => IGNORE_DIRS.has(part))
}

function isCodeFile(filePath) {
  return CODE_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

function isFrontendFile(relativePath) {
  return relativePath.includes('/app/')
}

function isServerFile(relativePath) {
  return relativePath.includes('/server/') && path.extname(relativePath) === '.ts'
}

async function collectFiles(baseDir) {
  const results = []
  const absoluteBaseDir = path.join(ROOT_DIR, baseDir)

  let entries
  try {
    entries = await fs.readdir(absoluteBaseDir, { withFileTypes: true })
  } catch {
    return results
  }

  for (const entry of entries) {
    const absolutePath = path.join(absoluteBaseDir, entry.name)
    const relativePath = toPosixPath(path.relative(ROOT_DIR, absolutePath))

    if (isIgnoredPath(relativePath)) {
      continue
    }

    if (entry.isDirectory()) {
      const nested = await collectFiles(relativePath)
      results.push(...nested)
      continue
    }

    if (entry.isFile() && isCodeFile(relativePath)) {
      results.push(relativePath)
    }
  }

  return results
}

async function loadAllowlist() {
  try {
    const content = await fs.readFile(allowlistPath, 'utf8')
    return JSON.parse(content)
  } catch {
    return {
      frontend_token_storage: [],
      raw_upstream_passthrough: [],
      fetch_without_timeout: [],
    }
  }
}

function makeViolation(rule, file, line, detail) {
  return { rule, file, line, detail }
}

function getLineNumber(content, index) {
  return content.slice(0, index).split('\n').length
}

function isAllowlisted(allowlist, rule, file) {
  const entries = Array.isArray(allowlist?.[rule]) ? allowlist[rule] : []
  return entries.includes(file)
}

async function run() {
  const allowlist = await loadAllowlist()
  const sourceFiles = (await Promise.all(SOURCE_ROOTS.map((root) => collectFiles(root)))).flat()
  const serverFiles = (await Promise.all(SERVER_ROOTS.map((root) => collectFiles(root)))).flat().filter((file) => isServerFile(file))
  const violations = []

  const tokenStoragePattern = /(localStorage|sessionStorage)\.(getItem|setItem|removeItem)\([^\n)]*(token|auth|session|customerId|customerToken)/i
  const passthroughPatterns = [
    {
      regex: /return\s+response\._data\b/,
      detail: 'Raw upstream payload passthrough detected (return response._data).',
    },
    {
      regex: /throw\s+createError\(\{[\s\S]{0,300}?statusMessage\s*:\s*error\.(message|statusMessage)\b/,
      detail: 'Route error statusMessage is directly sourced from upstream error object.',
    },
    {
      regex: /throw\s+createError\(\{[\s\S]{0,300}?data\s*:\s*error\.(details|data)\b/,
      detail: 'Route error data is directly sourced from upstream error object.',
    },
    {
      regex: /message\s*:\s*error\.stack\b/,
      detail: 'Route response message includes stack trace content.',
    },
  ]

  for (const file of sourceFiles) {
    if (!isFrontendFile(file)) {
      continue
    }

    if (isAllowlisted(allowlist, 'frontend_token_storage', file)) {
      continue
    }

    const content = await fs.readFile(path.join(ROOT_DIR, file), 'utf8')
    const match = tokenStoragePattern.exec(content)

    if (match) {
      violations.push(
        makeViolation(
          'frontend_token_storage',
          file,
          getLineNumber(content, match.index),
          'Token/session storage pattern detected in frontend code.',
        ),
      )
    }
  }

  for (const file of serverFiles) {
    if (isAllowlisted(allowlist, 'raw_upstream_passthrough', file)) {
      continue
    }

    const content = await fs.readFile(path.join(ROOT_DIR, file), 'utf8')

    for (const pattern of passthroughPatterns) {
      const match = pattern.regex.exec(content)
      if (match) {
        violations.push(makeViolation('raw_upstream_passthrough', file, getLineNumber(content, match.index), pattern.detail))
      }
    }
  }

  for (const file of serverFiles) {
    if (!file.includes('/server/api/')) {
      continue
    }

    if (isAllowlisted(allowlist, 'fetch_without_timeout', file)) {
      continue
    }

    const content = await fs.readFile(path.join(ROOT_DIR, file), 'utf8')
    const fetchMatch = /\b(\$fetch(\.raw)?|fetch)\s*\(/.exec(content)

    if (!fetchMatch) {
      continue
    }

    const hasTimeoutCoverage = /AbortController|timeout\s*:|signal\s*:/.test(content)

    if (!hasTimeoutCoverage) {
      violations.push(
        makeViolation(
          'fetch_without_timeout',
          file,
          getLineNumber(content, fetchMatch.index),
          'Server fetch call without timeout or abort signal coverage.',
        ),
      )
    }
  }

  if (violations.length > 0) {
    console.error('Invariant check failed. Violations:')
    for (const violation of violations) {
      console.error(`- [${violation.rule}] ${violation.file}:${violation.line} ${violation.detail}`)
    }
    console.error('Use scripts/invariant-allowlist.json for reviewed exceptions.')
    process.exit(1)
  }

  console.log('Invariant check passed. No forbidden patterns found.')
}

run().catch((error) => {
  console.error('Invariant check failed unexpectedly:', error)
  process.exit(1)
})
