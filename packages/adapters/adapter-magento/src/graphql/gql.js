const documents = {};
export function graphql(source) {
    return documents[source] ?? {};
}
