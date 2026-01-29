/**
 * Encode filename for URL usage
 */
export function encodeImageSlug(pathname) {
    return encodeURIComponent(pathname.split('.')[0]);
}
/**
 * Decode URL slug back to filename
 */
export function decodeImageSlug(slug) {
    return decodeURIComponent(slug);
}
/**
 * Check if two image paths match (handling encoding)
 */
export function isImageMatch(pathname, slug) {
    const imageName = pathname.split('.')[0];
    const decodedSlug = decodeImageSlug(slug);
    return imageName === decodedSlug;
}
