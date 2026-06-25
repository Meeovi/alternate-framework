export class SearchPipeline {
  private before: Array<(q: unknown) => unknown> = [];
  private after: Array<(r: unknown) => unknown> = [];

  useBefore(fn: (query: unknown) => unknown): void {
    this.before.push(fn);
  }

  useAfter(fn: (result: unknown) => unknown): void {
    this.after.push(fn);
  }

  runBefore(query: unknown): unknown {
    return this.before.reduce((q, fn) => fn(q), query);
  }

  runAfter(result: unknown): unknown {
    return this.after.reduce((r, fn) => fn(r), result);
  }
}
