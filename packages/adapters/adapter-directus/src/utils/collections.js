export function getCollection(schema, name) {
    return schema.collections.find(c => c.collection === name);
}
export function getCollectionFields(schema, name) {
    return schema.fields.filter(f => f.collection === name);
}
export function listCollections(schema) {
    return schema.collections.map(c => c.collection);
}
export function isSingleton(schema, name) {
    const col = getCollection(schema, name);
    return col?.meta?.singleton === true;
}
