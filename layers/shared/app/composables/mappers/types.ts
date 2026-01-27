export type MapperFn<TInput, TOutput> = (input: TInput) => TOutput

export interface MapperDefinition<TInput, TOutput> {
  name: string
  map: MapperFn<TInput, TOutput>
}