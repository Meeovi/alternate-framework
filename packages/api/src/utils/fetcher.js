import { getFetcher } from '../fetcher/registry';
export async function fetcher(operation, variables, options) {
    const activeFetcher = getFetcher();
    return activeFetcher.execute({
        operation,
        variables,
        options
    });
}
