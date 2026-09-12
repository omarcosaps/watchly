import type { CatalogItem } from "@/lib/catalog/types"
import { yearFromDate } from "@/lib/catalog/types"
import type { TmdbTrendingItem } from "@/lib/tmdb/types"

export const isTrendingTitle = (item: TmdbTrendingItem) => {
  if (item.adult) return false
  return item.media_type === "movie" || item.media_type === "tv"
}

export const toCatalogItemFromTrending = (item: TmdbTrendingItem): CatalogItem | null => {
  if (!isTrendingTitle(item)) return null

  const mediaType = item.media_type === "movie" ? "movie" : "tv"
  const title =
    mediaType === "movie" ? (item.title ?? item.name ?? "") : (item.name ?? item.title ?? "")
  const date = mediaType === "movie" ? item.release_date : item.first_air_date

  return {
    tmdbId: item.id,
    mediaType,
    title,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    year: yearFromDate(date),
    popularity: item.popularity,
    voteAverage: item.vote_average ?? 0,
    date: date || null,
    offers: [],
    onOwnServices: false,
  }
}

export const hasHeroStill = (item: CatalogItem) => {
  return Boolean(item.backdropPath || item.posterPath)
}

export const hasCatalogOffer = (item: CatalogItem) => {
  return item.offers.length > 0
}

export const pickHeroItems = (items: CatalogItem[], limit = 5) => {
  return items.filter(hasHeroStill).slice(0, limit)
}
