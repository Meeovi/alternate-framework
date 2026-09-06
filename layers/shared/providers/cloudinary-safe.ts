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
  return cloudinaryProvider()
})
