// Scores how well `query` matches `text` as a fuzzy subsequence (characters of
// `query` must appear in order in `text`, but not necessarily contiguously).
// Returns null when `query` isn't a subsequence of `text` at all. Higher
// scores favor consecutive runs, word-boundary starts, and earlier matches,
// so results can be ranked by relevance rather than just included/excluded.
export function fuzzyScore(text: string, query: string): number | null {
  if (!query) return 0

  const t = text.toLowerCase()
  const q = query.toLowerCase()

  let score = 0
  let textIndex = 0
  let consecutive = 0

  for (const char of q) {
    const foundAt: number = t.indexOf(char, textIndex)
    if (foundAt === -1) return null // that means the character doesn't exist in the query

    const isConsecutive = foundAt === textIndex
    const isWordStart = foundAt === 0 || /[^a-z0-9]/.test(t[foundAt - 1])

    score += 1
    if (isConsecutive) score += 2 + consecutive
    if (isWordStart) score += 3
    score -= foundAt * 0.01

    consecutive = isConsecutive ? consecutive + 1 : 0
    textIndex = foundAt + 1
  }

  return score
}

// Highest fuzzy score for `query` across multiple candidate fields (e.g. a
// bookmark's title, domain, and folder path), or null if none match.
export function bestFuzzyScore(fields: string[], query: string): number | null {
  let best: number | null = null

  for (const field of fields) {
    const score = fuzzyScore(field, query)
    if (score !== null && (best === null || score > best)) best = score
  }

  return best
}
