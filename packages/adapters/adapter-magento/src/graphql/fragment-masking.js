export function useFragment(_documentNode, fragmentType) {
    return fragmentType;
}
export function makeFragmentData(data, _fragment) {
    return data;
}
export function isFragmentReady(queryNode, fragmentNode, data) {
    const deferredFields = queryNode.__meta__?.deferredFields;
    const fragName = fragmentNode.__meta__?.fragmentName;
    if (!deferredFields || !fragName)
        return true;
    const fields = deferredFields[fragName] ?? [];
    return fields.length > 0 && fields.every(field => data && field in data);
}
