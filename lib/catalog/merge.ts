import type { CatalogSort } from "@/lib/catalog/params"
import type { CatalogItem } from "@/lib/catalog/types"
import { yearFromDate } from "@/lib/catalog/types"
import type { MediaType } from "@/lib/media"
import type { TmdbMovieListItem, TmdbTvListItem } from "@/lib/tmdb/types"

export const toCatalogItemFromMovie = (item: TmdbMovieListItem): CatalogItem => {
  return {
    tmdbId: item.id,
    mediaType: "movie",
    title: item.title,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    year: yearFromDate(item.release_date),
    popularity: item.popularity,
    voteAverage: item.vote_average,
    date: item.release_date || null,
    offers: [],
    onOwnServices: false,
  }
}

export const toCatalogItemFromTv = (item: TmdbTvListItem): CatalogItem => {
  return {
    tmdbId: item.id,
    mediaType: "tv",
    title: item.name,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    year: yearFromDate(item.first_air_date),
    popularity: item.popularity,
    voteAverage: item.vote_average,
    date: item.first_air_date || null,
    offers: [],
    onOwnServices: false,
  }
}

export const mergeCatalogPages = (
  movies: TmdbMovieListItem[],
  shows: TmdbTvListItem[],
  sort: CatalogSort,
) => {
  const items = [
    ...movies.map(toCatalogItemFromMovie),
    ...shows.map(toCatalogItemFromTv),
  ]

  return dedupeItems(items).sort(compareItems(sort))
}

export const dedupeItems = (items: CatalogItem[]) => {
  const seen = new Set<string>()

  return items.filter((item) => {
    const key = `${item.mediaType}:${item.tmdbId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const compareItems = (sort: CatalogSort) => {
  return (a: CatalogItem, b: CatalogItem) => {
    if (sort === "vote") return b.voteAverage - a.voteAverage
    if (sort === "date") return (b.date ?? "").localeCompare(a.date ?? "")
    return b.popularity - a.popularity
  }
}

export const itemKey = (mediaType: MediaType, tmdbId: number) => {
  return `${mediaType}:${tmdbId}`
}
