export function createNormalizer<TInput, TOutput>(
  fn: (input: TInput) => TOutput
) {
  return (input: TInput): TOutput => {
    return fn(input)
  }
}