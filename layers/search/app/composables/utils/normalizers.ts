export function normalizeOpenSearchHit(hit: any) {
  return {
    id: hit._id,
    ...hit._source
  }
}