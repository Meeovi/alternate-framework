import { registerFetcher, setActiveFetcher } from '../fetcher/fetcherRegistry';
export function defineApiPlugin(plugin) {
    const ctx = {
        registerFetcher,
        setActiveFetcher
    };
    plugin(ctx);
}
