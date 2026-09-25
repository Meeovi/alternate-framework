// Generic fallback for any product/content image that fails to load —
// Directus asset 404s, a misconfigured image provider (see
// layers/shared/nuxt.config.ts's `image.cloudinary.baseURL`, which falls
// back to a placeholder cloud name — "nuxt-cloudinary" — when
// CLOUDINARY_CLOUD_NAME isn't set, so every image routed through
// provider="cloudinary" 404s until that env var is set for real), a broken
// remote URL, etc. Use with useImageFallback() below rather than wiring
// @error handlers ad hoc at every call site.
export const PLACEHOLDER_IMAGE_URL = 'https://placehold.net/product-600x600.png'

export function getAssetURL(id: string | undefined | unknown): string | null {
  if (!id) return null
  let filename: string | undefined
  if (typeof id === 'object') {
    const obj = id as any
    // An M2M files junction row ({ id, directus_files_id }) — e.g. a
    // `media.*.*` expansion. Its own `id` is the junction row's integer pk,
    // so falling through to it produced "/assets/8", which Directus rejects.
    if (obj.directus_files_id) return getAssetURL(obj.directus_files_id)
    const remote = [obj.filename, obj.filename_download, obj.url].find(
      (v) => typeof v === 'string' && /^(https?:)?\/\//.test(v),
    )
    // Directus only serves /assets/<file uuid>; filename_download is just the
    // original upload name and 403s, so the id wins when there is one.
    filename = remote || obj.id || obj.filename_download || obj.filename
  } else {
    filename = String(id)
  }
  if (!filename) return null
  // Already a full URL — e.g. an atproto avatar/embed from cdn.bsky.app,
  // merged into a Directus-shaped list alongside real Directus asset ids.
  // Previously always treated as a Directus filename regardless, producing
  // "{directusUrl}/assets/https://cdn.bsky.app/..." — a guaranteed 404.
  if (/^(https?:)?\/\//.test(filename)) return filename
  const directusUrl = useRuntimeConfig().public.directusUrl
  if (!directusUrl) return null
  return `${directusUrl}/assets/${filename}`
}

export function hasAsset(id: string | undefined | unknown): boolean {
  return getAssetURL(id) !== null
}
