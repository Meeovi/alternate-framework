const bannedWords = ['spamword1', 'spamword2'] // extend as needed

export const checkContentForAbuse = (content: string) => {
  const lower = content.toLowerCase()
  for (const word of bannedWords) {
    if (lower.includes(word)) {
      throw new Error('Content violates guidelines')
    }
  }
}
