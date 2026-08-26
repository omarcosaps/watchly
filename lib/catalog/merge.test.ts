import { describe, expect, it } from "vitest"

import { toCatalogItemFromMovie, toCatalogItemFromTv } from "./merge"
import type { TmdbMovieListItem, TmdbTvListItem } from "@/lib/tmdb/types"

const movie: TmdbMovieListItem = {
  id: 1,
  title: "Duna",
  original_title: "Dune",
  overview: "",
  poster_path: "/poster.jpg",
  backdrop_path: "/still.jpg",
  release_date: "2021-10-22",
  popularity: 10,
  vote_average: 8.1,
  genre_ids: [],
  adult: false,
}

const show: TmdbTvListItem = {
  id: 2,
  name: "Separação",
  original_name: "Severance",
  overview: "",
  poster_path: "/poster-tv.jpg",
  backdrop_path: null,
  first_air_date: "2022-02-18",
  popularity: 9,
  vote_average: 8.6,
  genre_ids: [],
  adult: false,
}

describe("toCatalogItem", () => {
  it("preserva o still cinematográfico do filme", () => {
    const item = toCatalogItemFromMovie(movie)

    expect(item.backdropPath).toBe("/still.jpg")
    expect(item.posterPath).toBe("/poster.jpg")
    expect(item.year).toBe(2021)
  })

  it("aceita série sem backdrop", () => {
    const item = toCatalogItemFromTv(show)

    expect(item.backdropPath).toBeNull()
    expect(item.title).toBe("Separação")
    expect(item.year).toBe(2022)
  })
})
