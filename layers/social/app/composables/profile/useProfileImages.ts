import { ref } from 'vue'
import { authClient } from '#auth/lib/auth-client'
import { useAssetUpload } from '#shared/app/composables/media/useAssetUpload'

/**
 * Changing your own avatar and cover from your profile. Both upload to
 * Pixanomy through /api/assets/upload (Turnstile-checked), then save the
 * returned link: the avatar on the member's account (users.image, like the
 * settings page's AvatarUploader), the cover through PUT
 * /api/profiles/me/cover.
 */

const MAX_MB = { avatar: 5, cover: 10 }

export function useProfileImages() {
  const { upload } = useAssetUpload()
  const busy = ref<'avatar' | 'cover' | null>(null)
  const error = ref('')

  const check = (file: File | undefined, kind: 'avatar' | 'cover') => {
    if (!file) return false
    if (!file.type.startsWith('image/')) {
      error.value = 'Please choose an image file.'
      return false
    }
    if (file.size > MAX_MB[kind] * 1024 * 1024) {
      error.value = `The ${kind} must be ${MAX_MB[kind]} MB or smaller.`
      return false
    }
    return true
  }

  const run = async <T>(kind: 'avatar' | 'cover', task: () => Promise<T>): Promise<T | undefined> => {
    error.value = ''
    busy.value = kind
    try {
      return await task()
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || `Your ${kind} couldn't be saved. Please try again.`
      return undefined
    } finally {
      busy.value = null
    }
  }

  const saveAvatar = async (url: string | null) => {
    const { error: err } = await authClient.updateUser({ image: url } as any)
    if (err) throw new Error(err.message || "Your avatar couldn't be saved.")
    return url
  }
  const saveCover = async (url: string | null) => {
    const res = await $fetch<{ cover: string | null }>('/api/profiles/me/cover', { method: 'PUT', body: { url } })
    return res.cover
  }

  /** Upload and save; resolves to the new link, or undefined on failure. */
  const changeAvatar = (file?: File) => check(file, 'avatar')
    ? run('avatar', async () => saveAvatar((await upload(file!, { category: 'avatars' })).url))
    : Promise.resolve(undefined)
  const changeCover = (file?: File) => check(file, 'cover')
    ? run('cover', async () => saveCover((await upload(file!, { category: 'covers' })).url))
    : Promise.resolve(undefined)
  const removeCover = () => run('cover', () => saveCover(null))

  return { busy, error, changeAvatar, changeCover, removeCover }
}
