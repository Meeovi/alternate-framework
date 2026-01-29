export function normalizeOpenSearchHit(hit) {
    return {
        id: hit._id,
        ...hit._source
    };
}
