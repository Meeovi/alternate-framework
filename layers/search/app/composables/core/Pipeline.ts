export class SearchPipeline {
  private before: ((q: any) => any)[] = []
  private after: ((r: any) => any)[] = []

  useBefore(fn: (query: any) => any) {
    this.before.push(fn)
  }

  useAfter(fn: (result: any) => any) {
    this.after.push(fn)
  }

  runBefore(query: any) {
    return this.before.reduce((q, fn) => fn(q), query)
  }

  runAfter(result: any) {
    return this.after.reduce((r, fn) => fn(r), result)
  }
}