import { extractOffers } from "@/lib/catalog/offers"
import type { CatalogItem } from "@/lib/catalog/types"
import { getMovieWatchProviders, getTvWatchProviders } from "@/lib/tmdb/queries"

export const hydrateOffers = async (
  items: CatalogItem[],
  region: string,
  ownProviderIds: number[],
  onlyOwn: boolean,
) => {
  const hydrated = await Promise.all(
    items.map(async (item) => {
      try {
        const response =
          item.mediaType === "movie"
            ? await getMovieWatchProviders(item.tmdbId)
            : await getTvWatchProviders(item.tmdbId)

        const offers = extractOffers(response.results[region], ownProviderIds, onlyOwn)

        return {
          ...item,
          offers,
          onOwnServices: offers.some((offer) => offer.isOwn),
        }
      } catch {
        return {
          ...item,
          offers: [],
          onOwnServices: false,
        }
      }
    }),
  )

  return hydrated
}
