export function gql(strings: TemplateStringsArray, ...expr: any[]): string {
  let result = ''
  strings.forEach((str, i) => {
    result += str + (expr[i] ?? '')
  })
  return result.trim()
}
