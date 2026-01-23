import { MapperDefinition } from './types'
import { MapperNotFoundError } from './errors'

const registry = new Map<string, MapperDefinition<any, any>>()

export function registerMapper<TInput, TOutput>(
  mapper: MapperDefinition<TInput, TOutput>
) {
  registry.set(mapper.name, mapper)
}

export function getMapper<TInput, TOutput>(
  name: string
): MapperDefinition<TInput, TOutput> {
  const mapper = registry.get(name)
  if (!mapper) {
    throw new MapperNotFoundError(name)
  }
  return mapper
}

export function hasMapper(name: string): boolean {
  return registry.has(name)
}

export function listMappers(): string[] {
  return Array.from(registry.keys())
}