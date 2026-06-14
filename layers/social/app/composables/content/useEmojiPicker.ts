// composables/useEmojiPicker.ts
import { ref } from "vue"
import { getEmojiIndex } from "../../../services/emoji"

export function useEmojiPicker() {
  const emojisOutput = ref("")
  const emojiIndex = getEmojiIndex()

  function addEmoji(emoji: any) {
    emojisOutput.value += emoji.native
  }

  return {
    emojiIndex,
    emojisOutput,
    addEmoji
  }
}
