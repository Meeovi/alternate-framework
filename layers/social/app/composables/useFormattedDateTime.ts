import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import { useI18n } from 'vue-i18n'

export function useFormattedDateTime(
  value: MaybeRefOrGetter<Date | number | string | null | undefined>,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeStyle: 'medium' },
) {
  const { locale } = useI18n()
  const formatter = computed(() => Intl.DateTimeFormat(locale.value, options))

  return computed(() => {
    const resolvedValue = toValue(value)
    return resolvedValue ? formatter.value.format(new Date(resolvedValue)) : ''
  })
}