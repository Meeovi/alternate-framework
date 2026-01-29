const fetchers = {};
let activeFetcherName = null;
export function registerFetcher(name, fetcher) {
    fetchers[name] = fetcher;
}
export function setActiveFetcher(name) {
    if (!fetchers[name])
        throw new Error(`Fetcher "${name}" not registered`);
    activeFetcherName = name;
}
export function getFetcher() {
    if (!activeFetcherName)
        throw new Error('No active fetcher set');
    return fetchers[activeFetcherName];
}
