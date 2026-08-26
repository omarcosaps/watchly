import { describe, expect, it } from "vitest"
import { buildDiscoverQuery } from "./discover-query"

const base = {
  region: "BR",
  providerIds: [8, 119],
  page: 1,
  mediaType: "movie" as const,
}

describe("buildDiscoverQuery", () => {
  it("exige região ISO de dois caracteres", () => {
    expect(() => buildDiscoverQuery({ ...base, region: "" })).toThrow("Região obrigatória")
    expect(() => buildDiscoverQuery({ ...base, region: "bra" })).toThrow("Região obrigatória")
  })

  it("desliga conteúdo adulto e junta provedores com pipe", () => {
    const query = buildDiscoverQuery(base)

    expect(query.include_adult).toBe("false")
    expect(query.watch_region).toBe("BR")
    expect(query.with_watch_providers).toBe("8|119")
    expect(query.language).toBe("pt-BR")
  })

  it("usa todas as formas de oferta no padrão", () => {
    const query = buildDiscoverQuery(base)

    expect(query.with_watch_monetization_types).toBe("flatrate|free|ads|rent|buy")
  })

  it("restringe a forma de oferta quando a UI pede", () => {
    const query = buildDiscoverQuery({ ...base, monetizationTypes: ["rent"] })

    expect(query.with_watch_monetization_types).toBe("rent")
  })

  it("usa o campo de ano certo para filme e série", () => {
    const movie = buildDiscoverQuery({ ...base, year: 2024 })
    const tv = buildDiscoverQuery({ ...base, mediaType: "tv", year: 2024 })

    expect(movie.primary_release_year).toBe("2024")
    expect(movie.first_air_date_year).toBeUndefined()
    expect(tv.first_air_date_year).toBe("2024")
    expect(tv.primary_release_year).toBeUndefined()
  })

  it("mapeia a ordenação pedida", () => {
    expect(buildDiscoverQuery({ ...base, sort: "popularity" }).sort_by).toBe("popularity.desc")
    expect(buildDiscoverQuery({ ...base, sort: "vote" }).sort_by).toBe("vote_average.desc")
    expect(buildDiscoverQuery({ ...base, sort: "date" }).sort_by).toBe("primary_release_date.desc")
    expect(buildDiscoverQuery({ ...base, mediaType: "tv", sort: "date" }).sort_by).toBe(
      "first_air_date.desc",
    )
  })
})
