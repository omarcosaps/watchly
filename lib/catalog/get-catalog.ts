import "server-only"

import { buildDiscoverQuery } from "@/lib/catalog/discover-query"
import { hydrateOffers } from "@/lib/catalog/hydrate"
import { mergeCatalogPages } from "@/lib/catalog/merge"
import type { CatalogQuery } from "@/lib/catalog/params"
import type { CatalogPage } from "@/lib/catalog/types"
import { discoverMovies, discoverTv } from "@/lib/tmdb/queries"

export const getCatalogPage = async (query: CatalogQuery): Promise<CatalogPage> => {
  const providerIds = query.filteredProviderIds?.length
    ? query.filteredProviderIds
    : query.providerIds

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
        sort: query.sort,
      })
    : null

  const [movies, shows] = await Promise.all([
    movieQuery ? discoverMovies(movieQuery) : null,
    tvQuery ? discoverTv(tvQuery) : null,
  ])

  const items = mergeCatalogPages(movies?.results ?? [], shows?.results ?? [], query.sort)
  const hydrated = await hydrateOffers(items, query.region, query.providerIds, true)

  return {
    page: query.page,
    totalPages: Math.max(movies?.total_pages ?? 1, shows?.total_pages ?? 1),
    items: hydrated,
  }
}
