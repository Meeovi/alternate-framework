import { MapperDefinition, MapperFn } from './types'

export function createMapper<TInput, TOutput>(
  name: string,
  fn: MapperFn<TInput, TOutput>
): MapperDefinition<TInput, TOutput> {
  return {
    name,
    map: fn
  }
}