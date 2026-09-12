import { describe, expect, it } from "vitest"

import {
  hasCatalogOffer,
  hasHeroStill,
  pickHeroItems,
  toCatalogItemFromTrending,
} from "./trending"
import type { CatalogItem } from "@/lib/catalog/types"
import type { TmdbTrendingItem } from "@/lib/tmdb/types"

const trendingMovie = (overrides: Partial<TmdbTrendingItem> = {}): TmdbTrendingItem => {
  return {
    id: 1,
    adult: false,
    media_type: "movie",
    title: "Duna",
    poster_path: "/poster.jpg",
    backdrop_path: "/still.jpg",
    release_date: "2021-10-22",
    popularity: 10,
    vote_average: 8.1,
    ...overrides,
  }
}

const catalogItem = (overrides: Partial<CatalogItem> = {}): CatalogItem => {
  return {
    tmdbId: 1,
    mediaType: "movie",
    title: "Duna",
    posterPath: "/poster.jpg",
    backdropPath: "/still.jpg",
    year: 2021,
    popularity: 10,
    voteAverage: 8.1,
    date: "2021-10-22",
    offers: [],
    onOwnServices: false,
    ...overrides,
  }
}

describe("toCatalogItemFromTrending", () => {
  it("mapeia filme e série na ordem da TMDB", () => {
    const movie = toCatalogItemFromTrending(trendingMovie())
    const show = toCatalogItemFromTrending(
      trendingMovie({
        id: 2,
        media_type: "tv",
        name: "Separação",
        title: undefined,
        first_air_date: "2022-02-18",
        release_date: undefined,
        backdrop_path: null,
        poster_path: "/poster-tv.jpg",
      }),
    )

    expect(movie).toMatchObject({
      tmdbId: 1,
      mediaType: "movie",
      title: "Duna",
      date: "2021-10-22",
    })
    expect(show).toMatchObject({
      tmdbId: 2,
      mediaType: "tv",
      title: "Separação",
      date: "2022-02-18",
    })
  })

  it("descarta pessoa e conteúdo adulto", () => {
    expect(
      toCatalogItemFromTrending(
        trendingMovie({ id: 3, media_type: "person", name: "Timothée", title: undefined }),
      ),
    ).toBeNull()
    expect(toCatalogItemFromTrending(trendingMovie({ adult: true }))).toBeNull()
  })
})

describe("pickHeroItems", () => {
  it("fica só com título que tem still", () => {
    const withBackdrop = catalogItem({ tmdbId: 1 })
    const withPoster = catalogItem({
      tmdbId: 2,
      backdropPath: null,
      posterPath: "/poster.jpg",
    })
    const withoutStill = catalogItem({
      tmdbId: 3,
      backdropPath: null,
      posterPath: null,
    })

    expect(hasHeroStill(withoutStill)).toBe(false)
    expect(pickHeroItems([withoutStill, withBackdrop, withPoster], 5)).toEqual([
      withBackdrop,
      withPoster,
    ])
  })

  it("limita a 5 títulos com arte", () => {
    const items = Array.from({ length: 7 }, (_, index) => {
      return catalogItem({ tmdbId: index + 1, title: `Título ${index + 1}` })
    })

    expect(pickHeroItems(items)).toHaveLength(5)
    expect(pickHeroItems(items).map((item) => item.tmdbId)).toEqual([1, 2, 3, 4, 5])
  })

  it("não entra título sem oferta", () => {
    const available = catalogItem({
      tmdbId: 1,
      offers: [
        {
          providerId: 8,
          providerName: "Netflix",
          logoPath: "/netflix.png",
          monetization: "flatrate",
          isOwn: false,
        },
      ],
    })
    const unavailable = catalogItem({ tmdbId: 2, offers: [] })

    expect(hasCatalogOffer(unavailable)).toBe(false)
    expect([available, unavailable].filter(hasCatalogOffer)).toEqual([available])
  })
})
