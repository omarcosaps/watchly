import "server-only"

import { buildDiscoverQuery } from "@/lib/catalog/discover-query"
import { hydrateOffers } from "@/lib/catalog/hydrate"
import { mergeCatalogPages } from "@/lib/catalog/merge"
import type { CatalogQuery } from "@/lib/catalog/params"
import type { CatalogItem, CatalogPage } from "@/lib/catalog/types"
import {
  hasCatalogOffer,
  hasHeroStill,
  toCatalogItemFromTrending,
} from "@/lib/catalog/trending"
import { discoverMovies, discoverTv, getTrendingAll } from "@/lib/tmdb/queries"

const getTrendingCatalogPage = async (query: CatalogQuery): Promise<CatalogPage> => {
  const trending = await getTrendingAll("week")
  const mapped = trending.results
    .map(toCatalogItemFromTrending)
    .filter((item): item is CatalogItem => item !== null)
    .filter(hasHeroStill)
  const hydrated = await hydrateOffers(mapped, query.region, query.providerIds, false)

  return {
    page: 1,
    totalPages: 1,
    items: hydrated.filter(hasCatalogOffer),
  }
}

export const getCatalogPage = async (query: CatalogQuery): Promise<CatalogPage> => {
  if (query.sort === "trending") {
    return getTrendingCatalogPage(query)
  }

  const providerIds = query.filteredProviderIds?.length ? query.filteredProviderIds : []

  const includeMovies = query.media !== "tv"
  const includeTv = query.media !== "movie"

  const movieQuery = includeMovies
    ? buildDiscoverQuery({
        region: query.region,
        providerIds,
        page: query.page,
        mediaType: "movie",
        monetizationTypes: query.monetizationTypes,
        genreId: query.genreMovieId,
        year: query.year,
        yearRange: query.yearRange,
        sort: query.sort,
      })
    : null

  const tvQuery = includeTv
    ? buildDiscoverQuery({
        region: query.region,
        providerIds,
        page: query.page,
        mediaType: "tv",
        monetizationTypes: query.monetizationTypes,
        genreId: query.genreTvId,
        year: query.year,
        yearRange: query.yearRange,
        sort: query.sort,
      })
    : null

  const [movies, shows] = await Promise.all([
    movieQuery ? discoverMovies(movieQuery) : null,
    tvQuery ? discoverTv(tvQuery) : null,
  ])

  const items = mergeCatalogPages(movies?.results ?? [], shows?.results ?? [], query.sort)
  const hydrated = await hydrateOffers(items, query.region, query.providerIds, false)

  return {
    page: query.page,
    totalPages: Math.max(movies?.total_pages ?? 1, shows?.total_pages ?? 1),
    items: hydrated,
  }
}
