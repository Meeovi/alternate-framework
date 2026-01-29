import { graphql, buildSchema } from 'graphql';
const schema = buildSchema(`
  type Hit { id: ID, title: String, description: String, price: Float }
  type SearchResult {
    items: [Hit]
    total: Int
    page: Int
    pageSize: Int
  }
  type Query {
    search(term: String, page: Int, pageSize: Int, filters: String): SearchResult
  }
`);
function parseFilters(filters) {
    if (!filters)
        return {};
    const entries = String(filters).split(' AND ').map((s) => s.split(':'));
    return Object.fromEntries(entries.map(([k, v]) => [k, v?.replace(/^"|"$/g, '')]));
}
export function createSearchkitGraphQLHandler(manager) {
    const root = {
        search: async ({ term, page, pageSize, filters }) => {
            manager.context.setQuery(term || '');
            manager.context.setPage(page || 1);
            manager.context.setPageSize(pageSize || manager.context.state.pageSize);
            if (filters) {
                manager.context.state.filters = parseFilters(filters);
            }
            const res = await manager.search();
            return {
                items: res.items,
                total: res.total,
                page: res.page,
                pageSize: res.pageSize
            };
        }
    };
    return async function handler(req, res) {
        const { query, variables } = req.body || {};
        const result = await graphql({ schema, source: query, rootValue: root, variableValues: variables });
        res.json(result);
    };
}
export default createSearchkitGraphQLHandler;
