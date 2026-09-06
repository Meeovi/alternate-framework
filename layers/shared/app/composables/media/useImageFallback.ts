import { computed, ref, type Ref } from 'vue'
import { PLACEHOLDER_IMAGE_URL } from '../../utils/get-asset-url'

/**
 * Failsafe wrapper for any `<NuxtImg>`/`<v-img>`/`<img>` bound to a remote
 * or provider-transformed URL (Directus assets, the misconfigured
 * `cloudinary` image provider, an atproto avatar, ...) — falls back to a
 * generic placeholder image on load failure instead of a broken-image icon
 * (or, worse, whatever's re-rendering/retrying the failed request).
 *
 * @param source A ref/computed holding the real image URL (or null/undefined
 *   when there isn't one — the placeholder is used in that case too).
 *
 * ```ts
 * const { src, onError } = useImageFallback(computed(() => getAssetURL(item.image)))
 * ```
 * ```vue
 * <NuxtImg :src="src" @error="onError" />
 * ```
 */
export function useImageFallback(source: Ref<string | null | undefined>) {
  const failed = ref(false)

  const isPlaceholder = computed(() => failed.value || !source.value)
  const src = computed(() => isPlaceholder.value ? PLACEHOLDER_IMAGE_URL : source.value!)

  function onError() {
    // Already showing the placeholder — if that itself fails to load (e.g.
    // offline), don't loop back into erroring on it again.
    if (failed.value) return
    failed.value = true
  }

  return { src, isPlaceholder, onError }
}
