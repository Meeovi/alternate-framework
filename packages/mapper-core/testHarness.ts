import { MapperDefinition } from './types'
import { MapperError } from './errors'

export interface MapperTestCase<TInput, TOutput> {
  name: string
  input: TInput
  expected: TOutput | ((output: TOutput) => void | Promise<void>)
  snapshot?: boolean
}

export interface MapperTestOptions<TInput, TOutput> {
  mapper: MapperDefinition<TInput, TOutput>
  cases: MapperTestCase<TInput, TOutput>[]
  async?: boolean
}

export async function runMapperTests<TInput, TOutput>(
  options: MapperTestOptions<TInput, TOutput>
) {
  const { mapper, cases } = options

  for (const testCase of cases) {
    const { name, input, expected, snapshot } = testCase

    try {
      const result = await maybeAsync(mapper.map, input)

      // Snapshot mode (stringified)
      if (snapshot) {
        const snap = JSON.stringify(result, null, 2)
        console.log(`\n📸 Snapshot for "${mapper.name}" → "${name}":\n${snap}\n`)
      }

      // Function-based expectation
      if (isExpectedFunction<TOutput>(expected)) {
        await expected(result)
        continue
      }

      // Deep equality check
      const pass = deepEqual(result, expected)
      if (!pass) {
        throw new MapperError(
          `Mapper "${mapper.name}" test "${name}" failed.\n` +
            diffString(expected, result)
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new MapperError(
          `Mapper "${mapper.name}" test "${name}" threw an error:\n${error.message}`
        )
      }
      throw error
    }
  }
}

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

async function maybeAsync<TInput, TOutput>(
  fn: (input: TInput) => TOutput | Promise<TOutput>,
  input: TInput
): Promise<TOutput> {
  return await fn(input)
}

function isExpectedFunction<TOutput>(
  value: unknown
): value is (output: TOutput) => void | Promise<void> {
  return typeof value === 'function'
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true

  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false
  }

  const aKeys = Object.keys(a as object)
  const bKeys = Object.keys(b as object)
  if (aKeys.length !== bKeys.length) return false

  for (const key of aKeys) {
    if (!deepEqual((a as any)[key], (b as any)[key])) return false
  }

  return true
}

/**
 * Pretty diff output (no deps)
 */
function diffString(expected: unknown, received: unknown): string {
  const exp = JSON.stringify(expected, null, 2)
  const rec = JSON.stringify(received, null, 2)

  return (
    `\nExpected:\n${indent(exp)}\n\nReceived:\n${indent(rec)}\n` +
    `\nDiff:\n${indent(generateDiff(exp, rec))}`
  )
}

function indent(str: string): string {
  return str
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')
}

/**
 * Minimal diff generator (line-by-line)
 */
function generateDiff(a: string, b: string): string {
  const aLines = a.split('\n')
  const bLines = b.split('\n')
  const max = Math.max(aLines.length, bLines.length)

  const diff: string[] = []

  for (let i = 0; i < max; i++) {
    const left = aLines[i]
    const right = bLines[i]

    if (left === right) {
      diff.push(`  ${left ?? ''}`)
    } else {
      if (left !== undefined) diff.push(`- ${left}`)
      if (right !== undefined) diff.push(`+ ${right}`)
    }
  }

  return diff.join('\n')
}