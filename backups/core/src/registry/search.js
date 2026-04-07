import { getRegistry } from './index';
export const search = {
    search: (query) => getRegistry().search?.search(query),
    facets: (query) => getRegistry().search?.facets(query)
};
