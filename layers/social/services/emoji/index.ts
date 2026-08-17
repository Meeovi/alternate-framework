// services/emoji/index.ts
import data from "emoji-mart-vue-fast/data/all.json"
// emoji-mart-vue-fast ships no type declarations of its own.
// @ts-expect-error untyped package
import { EmojiIndex } from "emoji-mart-vue-fast"

let _index: any = null

export function getEmojiIndex() {
  if (!_index) {
    _index = new EmojiIndex(data)
  }
  return _index
}
