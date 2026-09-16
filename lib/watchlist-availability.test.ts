import { describe, expect, it } from "vitest"

import type { CatalogItem } from "@/lib/catalog/types"
import { availabilityLine, formatOfferNames } from "@/lib/watchlist-availability"

const offer = (providerName: string, isOwn = false): CatalogItem["offers"][number] => {
  return {
    providerId: providerName.length,
    providerName,
    logoPath: null,
    monetization: "flatrate",
    isOwn,
  }
}

const item = (overrides: Partial<CatalogItem>): CatalogItem => {
  return {
    tmdbId: 1,
    mediaType: "movie",
    title: "Dune",
    posterPath: null,
    backdropPath: null,
    year: 2021,
    popularity: 0,
    voteAverage: 0,
    date: null,
    offers: [],
    onOwnServices: false,
    ...overrides,
  }
}

describe("formatOfferNames", () => {
  it("junta até dois nomes", () => {
    expect(formatOfferNames(["Netflix"])).toBe("Netflix")
    expect(formatOfferNames(["Netflix", "Prime Video"])).toBe("Netflix · Prime Video")
  })

  it("corta depois de dois nomes e acrescenta e mais", () => {
    expect(formatOfferNames(["Netflix", "Prime Video", "Disney+"])).toBe(
      "Netflix · Prime Video e mais",
    )
  })
})

describe("availabilityLine", () => {
  it("lista os próprios serviços e corta o excesso", () => {
    expect(
      availabilityLine(
        item({
          onOwnServices: true,
          offers: [
            offer("Netflix", true),
            offer("Prime Video", true),
            offer("Disney+", true),
            offer("Max"),
          ],
        }),
        "Brasil",
      ),
    ).toEqual({
      label: "Disponível em Netflix · Prime Video e mais",
      color: "text-positive",
    })
  })

  it("lista ofertas fora dos serviços em no máximo dois nomes", () => {
    expect(
      availabilityLine(
        item({
          offers: [offer("Max"), offer("Apple TV"), offer("Paramount+")],
        }),
        "Brasil",
      ),
    ).toEqual({
      label: "Fora dos seus serviços — Max · Apple TV e mais",
      color: "text-white/55",
    })
  })

  it("diz quando não há oferta na região", () => {
    expect(availabilityLine(item({}), "Brasil")).toEqual({
      label: "Sem oferta em Brasil no momento",
      color: "text-alert",
    })
  })
})
