export function safeRelation(idOrObject) {
    if (!idOrObject)
        return undefined;
    if (typeof idOrObject === 'string') {
        return {
            id: idOrObject,
        };
    }
    if (idOrObject.id) {
        return idOrObject.id;
    }
    return null;
}
export function safeRelationId(idOrObject) {
    if (!idOrObject)
        return null;
    if (typeof idOrObject === 'string') {
        return idOrObject;
    }
    if (idOrObject.id) {
        return idOrObject.id;
    }
    return null;
}
