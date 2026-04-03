export const emojiRegEx = /\p{Extended_Pictographic}/gu

export function getEmojiAttributes(emoji: string) {
  const codepoint = Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter((value): value is string => Boolean(value))
    .join('-')

  return {
    src: `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoint}.svg`,
    alt: emoji,
    class: 'inline-block h-5 w-5 align-text-bottom',
  }
}
