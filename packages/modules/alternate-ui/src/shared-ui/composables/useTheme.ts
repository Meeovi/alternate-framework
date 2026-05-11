import { tokens } from '../../tokens'
import { computed } from 'vue'

export function useTheme() {
  const name = useState<'light' | 'dark'>('ui:theme:name', () => 'light')

  return {
    tokens,
    global: {
      name,
    },
    current: computed(() => name.value),
    change(next: 'light' | 'dark') {
      name.value = next
    },
  }
}