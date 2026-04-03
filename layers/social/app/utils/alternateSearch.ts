import { cosineSimilarity, tokenize, vectorize } from 'alternate-search'

type SearchableText = string | null | undefined

const TOKENIZE_OPTIONS = {
  minLength: 1,
  stopwords: false,
} as const

function normalizeTokens(text: string) {
  return tokenize(text, TOKENIZE_OPTIONS)
}

function computeScore(queryText: string, docText: string): number {
  if (!docText)
    return 0

  const queryLower = queryText.toLowerCase()
  const docLower = docText.toLowerCase()

  const queryTokens = normalizeTokens(queryLower)
  if (!queryTokens.length)
    return 0

  const docTokens = normalizeTokens(docLower)
  if (!docTokens.length)
    return 0

  let matchedTokens = 0
  for (const queryToken of queryTokens) {
    if (docTokens.some(docToken => docToken.includes(queryToken) || queryToken.includes(docToken)))
      matchedTokens++
  }

  const tokenCoverageScore = matchedTokens / queryTokens.length
  const queryVector = vectorize(queryTokens, { dimensions: 64 })
  const docVector = vectorize(docTokens, { dimensions: 64 })
  const vectorScore = cosineSimilarity(queryVector, docVector)
  const startsWithBonus = docLower.startsWith(queryLower) ? 0.25 : 0
  const includesBonus = !startsWithBonus && docLower.includes(queryLower) ? 0.15 : 0

  return vectorScore * 0.65 + tokenCoverageScore * 0.25 + startsWithBonus + includesBonus
}

export function rankByQuery<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => SearchableText[],
  limit?: number,
): T[] {
  const normalizedQuery = query.trim()
  if (!normalizedQuery)
    return []

  const scoredItems = items
    .map((item, index) => {
      const searchableText = getSearchableText(item)
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
        .join(' ')

      return {
        item,
        index,
        score: computeScore(normalizedQuery, searchableText),
      }
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)

  const ranked = scoredItems.map(entry => entry.item)
  return typeof limit === 'number' ? ranked.slice(0, limit) : ranked
}