import type { ZodSchema } from 'zod'
import type { MapperDefinition, MapperFn } from './types'
import { createMapper } from './createMapper'
import { MapperError } from './errors'

export interface ZodMapperOptions<TInput, TOutput> {
  name: string
  inputSchema: ZodSchema<TInput>
  outputSchema: ZodSchema<TOutput>
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
        `Mapper "${name}" input validation failed: ${parsedInput.error.message}`
      )
    }

    const output = map(parsedInput.data)

    const parsedOutput = outputSchema.safeParse(output)
    if (!parsedOutput.success) {
      throw new MapperError(
        `Mapper "${name}" output validation failed: ${parsedOutput.error.message}`
      )
    }

    return parsedOutput.data
  })
}