import "server-only"

import { hydrateOffers } from "@/lib/catalog/hydrate"
import { mergeCatalogPages } from "@/lib/catalog/merge"
import type { CatalogSort } from "@/lib/catalog/params"
import type { CatalogPage } from "@/lib/catalog/types"
import { searchMovies, searchTv } from "@/lib/tmdb/queries"

export const getSearchPage = async (input: {
  query: string
  page: number
  region: string
  providerIds: number[]
  sort?: CatalogSort
}): Promise<CatalogPage> => {
  const term = input.query.trim()

  if (!term) {
    throw new Error("Digite um título para buscar")
  }

  const [movies, shows] = await Promise.all([
    searchMovies(term, input.page),
    searchTv(term, input.page),
  ])

  const items = mergeCatalogPages(movies.results, shows.results, input.sort ?? "popularity")
  const hydrated = await hydrateOffers(items, input.region, input.providerIds, false)

  return {
    page: input.page,
    totalPages: Math.max(movies.total_pages, shows.total_pages, 1),
    items: hydrated,
  }
}
