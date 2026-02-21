export const isHydrated = { value: true }
export function onHydrated(cb: () => void) {
  if (isHydrated.value)
    cb()
}

