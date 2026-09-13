import { computed, useState } from '#imports'
import { usePixanomyContent, type PixanomyMediaItem } from './usePixanomyContent'

// Shared preview-dialog state for Pixanomy. Every pixSections/* component
// emits `open` up to its page, which calls `open(item)` here; the single
// <PixMediaViewer> mounted in pixanomy/index.vue renders the dialog. State
// is useState-backed so it's the same dialog no matter which tab/section
// triggered it.
export function usePixanomyViewer() {
  const current = useState<PixanomyMediaItem | null>('pixanomy:viewer:item', () => null)
  const isOpen = useState<boolean>('pixanomy:viewer:open', () => false)
  const { recordView } = usePixanomyContent()

  const open = (item: PixanomyMediaItem) => {
    current.value = item
    isOpen.value = true
    // Opening a card is the "visit" a featured ranking counts. Fire and
    // forget — recordView already swallows its own errors, and the
    // server ignores the owner's own views.
    if (item?.id != null) void recordView(item.id)
  }

  const close = () => {
    isOpen.value = false
  }

  return {
    current: computed(() => current.value),
    isOpen,
    open,
    close,
  }
}
