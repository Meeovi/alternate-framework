import { useMagicKeys } from '@vueuse/core'
import { computed, ref, watch, type ComputedRef } from 'vue'

/**
 * Minimal shared `useMagicSequence` composable copied from `layers/social`.
 */
export function useMagicSequence(keys: string[]): ComputedRef<boolean> {
  const magicKeys = useMagicKeys()

  const success = ref(false)
  const i = ref(0)
  let down = false

  watch(
    () => magicKeys.current,
    () => {
      if (magicKeys[keys[i.value]].value && !down) {
        down = true
        i.value += 1
      }
      else if (i.value > 0 && !magicKeys[keys[i.value - 1]].value && down) {
        down = false
      }
      else {
        i.value = 0
        down = false
        success.value = false
      }
      if (i.value >= keys.length && !down) {
        i.value = 0
        down = false
        success.value = true
      }
    },
    {
      deep: true,
    },
  )

  return computed(() => success.value)
}
