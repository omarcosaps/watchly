const INCOMPLETE_CLAUSE_END =
  /(?:quando|que|se|como|porque|enquanto|embora|onde|para|de|em|com|por|mas|e|ou)$/iu

const normalizeWhitespace = (value: string) => {
  return value.replace(/\s+/g, " ").trim()
}

const finishCandidate = (value: string) => {
  const trimmed = value.replace(/(?:\.\.\.|…|[.,;:–—-])+$/u, "").trim()
  if (!trimmed) return ""
  return `${trimmed}.`
}

const splitSynopsisSentences = (text: string) => {
  const matches = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)
  if (!matches) return []
  return matches.map((part) => part.trim()).filter(Boolean)
}

const joinSentences = (sentences: string[]) => {
  return normalizeWhitespace(sentences.join(" "))
}

const isCompleteClause = (value: string) => {
  const trimmed = value.replace(/(?:\.\.\.|…|[.,;:–—-])+$/u, "").trim()
  if (trimmed.length < 12) return false
  return !INCOMPLETE_CLAUSE_END.test(trimmed)
}

const splitCompleteClauses = (sentence: string) => {
  const prefixes: string[] = []
  const boundary = /[;–—,](\s+)/gu
  let match = boundary.exec(sentence)

  while (match) {
    const prefix = sentence.slice(0, match.index)
    if (isCompleteClause(prefix)) {
      prefixes.push(finishCandidate(prefix))
    }
    match = boundary.exec(sentence)
  }

  return prefixes
}

const uniqueCandidates = (candidates: string[]) => {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const candidate of candidates) {
    if (!candidate || seen.has(candidate)) continue
    seen.add(candidate)
    unique.push(candidate)
  }

  return unique
}

export const buildHeroSynopsisCandidates = (overview: string) => {
  const normalized = normalizeWhitespace(overview)
  if (!normalized) return []

  const sentences = splitSynopsisSentences(normalized)
  const candidates = [normalized]

  for (let count = sentences.length - 1; count >= 1; count -= 1) {
    candidates.push(joinSentences(sentences.slice(0, count)))
  }

  const firstSentence = sentences[0]
  if (firstSentence) {
    for (const clause of splitCompleteClauses(firstSentence)) {
      candidates.push(clause)
    }
  }

  return uniqueCandidates(candidates)
}

export const pickHeroSynopsis = (
  overview: string,
  fits: (text: string) => boolean,
) => {
  const candidates = buildHeroSynopsisCandidates(overview)
  if (candidates.length === 0) return ""
  return candidates.find((candidate) => fits(candidate)) ?? candidates[candidates.length - 1] ?? ""
}
