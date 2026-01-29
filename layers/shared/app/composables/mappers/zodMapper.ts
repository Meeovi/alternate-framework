import type { MapperDefinition, MapperFn } from './types'
import { createMapper } from './createMapper'
import { MapperError } from './errors'

// Minimal local Zod-like schema type to avoid hard dependency on zod typings here.
export type SimpleZodSchema<T> = {
  safeParse(input: unknown): { success: boolean; data?: T; error?: { message?: string } }
}

export interface ZodMapperOptions<TInput, TOutput> {
  name: string
  inputSchema: SimpleZodSchema<TInput>
  outputSchema: SimpleZodSchema<TOutput>
  map: MapperFn<TInput, TOutput>
}

export function createZodMapper<TInput, TOutput>(
  options: ZodMapperOptions<TInput, TOutput>
): MapperDefinition<TInput, TOutput> {
  const { name, inputSchema, outputSchema, map } = options

  return createMapper<TInput, TOutput>(name, (rawInput) => {
    const parsedInput = inputSchema.safeParse(rawInput)
    if (!parsedInput.success) {
      throw new MapperError(
        `Mapper "${name}" input validation failed: ${parsedInput.error?.message ?? 'validation error'}`
      )
    }

    const input = parsedInput.data as TInput
    const output = map(input)
    if (typeof output === 'undefined') {
      throw new MapperError(`Mapper "${name}" produced undefined output`)
    }

    const parsedOutput = outputSchema.safeParse(output)
    if (!parsedOutput.success) {
      throw new MapperError(
        `Mapper "${name}" output validation failed: ${parsedOutput.error?.message ?? 'validation error'}`
      )
    }

    return parsedOutput.data as TOutput
  })
}