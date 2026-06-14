// services/emoji/index.ts
import data from "emoji-mart-vue-fast/data/all.json"
import { EmojiIndex } from "emoji-mart-vue-fast"

let _index: any = null

export function getEmojiIndex() {
  if (!_index) {
    _index = new EmojiIndex(data)
  }
  return _index
}
