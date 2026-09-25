import { defineProvider } from '@nuxt/image/runtime'
import cloudinaryProvider from '@nuxt/image/runtime/providers/cloudinary'

/**
 * Wraps @nuxt/image's built-in `cloudinary` provider so a missing
 * `CLOUDINARY_CLOUD_NAME` degrades gracefully instead of 404ing every
 * image on the site.
 *
 * Without this, an unset cloud name silently fell back to the literal
 * string 'nuxt-cloudinary' as the account name, and every `<NuxtImg
 * provider="cloudinary">` request resolved against
 * `res.cloudinary.com/nuxt-cloudinary/...` — an account that doesn't
 * exist, so every hero image, product photo and avatar 404ed.
 *
 * With a real cloud name configured, this defers entirely to the stock
 * provider (same transforms, same behaviour). Without one, it serves the
 * original, untransformed image URL — no optimisation, but a working
 * image instead of a broken one.
 */
const cloudName = process.env.CLOUDINARY_CLOUD_NAME

export default defineProvider(() => {
  if (!cloudName) {
    return {
      getImage: (src: string) => ({ url: src }),
    }
  }
  // Absolute URLs from elsewhere (Pixanomy uploads, Directus assets,
  // atproto avatars) aren't in this Cloudinary account — the stock provider
  // would just prepend the upload baseURL and 404. Serve those as-is.
  const stock = cloudinaryProvider() as any
  return {
    ...stock,
    getImage: (src: string, options: any, ctx: any) =>
      /^(https?:)?\/\//.test(src) && !src.includes('res.cloudinary.com')
        ? { url: src }
        : stock.getImage(src, options, ctx),
  }
})
