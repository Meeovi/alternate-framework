import apolloClientPkg from '@apollo/client';
import fetch from 'cross-fetch';
const { ApolloClient, InMemoryCache, HttpLink } = apolloClientPkg;
let client = null;
export function createApolloClient(uri) {
    client = new ApolloClient({
        link: new HttpLink({ uri, fetch }),
        cache: new InMemoryCache()
    });
    return client;
}
export function getApolloClient() {
    if (!client) {
        throw new Error('Apollo client not initialized. Call createApolloClient() first.');
    }
    return client;
}
