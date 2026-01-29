export class SearchPipeline {
    before = [];
    after = [];
    useBefore(fn) {
        this.before.push(fn);
    }
    useAfter(fn) {
        this.after.push(fn);
    }
    runBefore(query) {
        return this.before.reduce((q, fn) => fn(q), query);
    }
    runAfter(result) {
        return this.after.reduce((r, fn) => fn(r), result);
    }
}
