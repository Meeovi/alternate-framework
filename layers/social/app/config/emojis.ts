import { emojiRegEx, emojiFilename, emojiPrefix } from '@iconify-emoji/twemoji'
import { getEmojiMatchesInText } from '@iconify/utils/lib/emoji/replace/find'

export { emojiRegEx }

export function getEmojiAttributes(input: any) {
  const match = typeof input === 'string' ? getEmojiMatchesInText(emojiRegEx, input)?.[0] : input
  const file = emojiFilename(match)
  const className = `iconify-emoji iconify-emoji--${emojiPrefix}${file.padding ? ' iconify-emoji-padded' : ''}`

  return {
    class: className,
    src: `/emojis/${emojiPrefix}/${file.filename}`,
    alt: match?.match,
  }
}
