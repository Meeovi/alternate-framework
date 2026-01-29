import { getApolloClient } from '../client/apollo';
export const GraphQLFetcher = {
    async execute(req) {
        try {
            const client = getApolloClient();
            const { data } = await client.query({
                query: req.operation,
                variables: req.variables || {}
            });
            return { data };
        }
        catch (error) {
            return { error };
        }
    }
};
