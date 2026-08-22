// services/emoji/index.ts
import data from "emoji-mart-vue-fast/data/all.json"
// emoji-mart-vue-fast ships no type declarations of its own, and its UMD
// bundle assigns `module.exports = fn()` (a computed value, not a static
// object literal) — Node's cjs-module-lexer can't statically detect named
// exports from that pattern, so `import { EmojiIndex } from '...'` throws
// "Named export not found" in a real Node ESM runtime (Nitro's production
// server), even though it resolves fine under Vite dev/build's more
// lenient CJS interop. Importing the default and destructuring is the
// interop-safe way to reach the same property.
// @ts-expect-error untyped package
import emojiMart from "emoji-mart-vue-fast"
const { EmojiIndex } = emojiMart

let _index: any = null

export function getEmojiIndex() {
  if (!_index) {
    _index = new EmojiIndex(data)
  }
  return _index
}
