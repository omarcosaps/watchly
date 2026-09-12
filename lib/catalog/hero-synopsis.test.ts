import { describe, expect, it } from "vitest"

import { buildHeroSynopsisCandidates, pickHeroSynopsis } from "./hero-synopsis"

const longSynopsis =
  "Maiaia Marten é a advogada brilhante de Londres, vê a sua vida ruir com uma ligação durante a sua corrida matinal que avisa que o seu filho foi sequestrado. Para recuperá-lo, ela deve continuar correndo, obedecer a cada comando e não confiar em ninguém. Cada segundo desta corrida testará até onde vai uma mãe para salvar a vida do seu filho."

const firstTwoSentences =
  "Maiaia Marten é a advogada brilhante de Londres, vê a sua vida ruir com uma ligação durante a sua corrida matinal que avisa que o seu filho foi sequestrado. Para recuperá-lo, ela deve continuar correndo, obedecer a cada comando e não confiar em ninguém."

const firstSentence =
  "Maiaia Marten é a advogada brilhante de Londres, vê a sua vida ruir com uma ligação durante a sua corrida matinal que avisa que o seu filho foi sequestrado."

const firstClause = "Maiaia Marten é a advogada brilhante de Londres."

const fitsMaxLength = (max: number) => {
  return (text: string) => text.length <= max
}

describe("buildHeroSynopsisCandidates", () => {
  it("devolve a original e os prefixos extrativos, sem reticências", () => {
    const candidates = buildHeroSynopsisCandidates(longSynopsis)

    expect(candidates[0]).toBe(longSynopsis)
    expect(candidates).toContain(firstTwoSentences)
    expect(candidates).toContain(firstSentence)
    expect(candidates).toContain(firstClause)
    expect(candidates.every((candidate) => !candidate.endsWith("..."))).toBe(true)
    expect(candidates.every((candidate) => !candidate.endsWith("…"))).toBe(true)
  })

  it("devolve vazio para texto em branco", () => {
    expect(buildHeroSynopsisCandidates("")).toEqual([])
    expect(buildHeroSynopsisCandidates("   \n  ")).toEqual([])
  })
})

describe("pickHeroSynopsis", () => {
  it("devolve a original quando o texto curto cabe", () => {
    const shortSynopsis = "Uma sinopse curta sobre o filme."

    expect(pickHeroSynopsis(shortSynopsis, () => true)).toBe(shortSynopsis)
    expect(pickHeroSynopsis(shortSynopsis, fitsMaxLength(shortSynopsis.length))).toBe(
      shortSynopsis,
    )
  })

  it("escolhe as duas primeiras frases da sinopse longa, sem reticências", () => {
    const picked = pickHeroSynopsis(longSynopsis, fitsMaxLength(firstTwoSentences.length))

    expect(picked).toBe(firstTwoSentences)
    expect(picked.endsWith("...")).toBe(false)
    expect(picked.includes("Cada segundo")).toBe(false)
  })

  it("reduz uma frase longa à oração inicial completa, sem cortar palavra", () => {
    const picked = pickHeroSynopsis(firstSentence, fitsMaxLength(firstClause.length))

    expect(picked).toBe(firstClause)
    expect(picked.endsWith("Londres.")).toBe(true)
    expect(picked.includes("brilhan")).toBe(true)
    expect(picked.includes("brilhan ")).toBe(false)
  })

  it("devolve string vazia para overview vazio", () => {
    expect(pickHeroSynopsis("", () => true)).toBe("")
    expect(pickHeroSynopsis("   ", () => false)).toBe("")
  })

  it("escolhe o candidato mais longo que cabe", () => {
    expect(pickHeroSynopsis(longSynopsis, fitsMaxLength(longSynopsis.length))).toBe(longSynopsis)
    expect(pickHeroSynopsis(longSynopsis, fitsMaxLength(firstTwoSentences.length))).toBe(
      firstTwoSentences,
    )
    expect(pickHeroSynopsis(longSynopsis, fitsMaxLength(firstSentence.length))).toBe(firstSentence)
    expect(pickHeroSynopsis(longSynopsis, fitsMaxLength(firstClause.length))).toBe(firstClause)
  })
})
