let activeFetcher = null;
export function setFetcher(fetcher) {
    activeFetcher = fetcher;
}
export function getFetcher() {
    if (!activeFetcher) {
        throw new Error('No fetcher has been set. Call setFetcher() first.');
    }
    return activeFetcher;
}
