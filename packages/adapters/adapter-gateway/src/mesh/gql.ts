export function gql(strings: TemplateStringsArray | string): unknown {
  return typeof strings === 'string' ? strings : strings[0]
}