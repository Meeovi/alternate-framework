/**
 * Convert Directus fields into a table schema.
 */
export function generateTableSchema(fields) {
    return fields
        .filter((f) => !f.hidden)
        .map((f) => ({
        key: f.field,
        label: prettifyLabel(f.field),
        type: f.type,
        sortable: true,
        hidden: false
    }));
}
/**
 * Convert "product_name" → "Product Name"
 */
function prettifyLabel(str) {
    return str
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}
/**
 * Fetch table rows from Directus.
 */
export async function fetchTableRows(directus, collection) {
    return await directus.request(directus.readItems(collection));
}
