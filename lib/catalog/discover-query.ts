import type { CatalogSort, MonetizationType } from "@/lib/catalog/params"
import { isIsoCountry, MONETIZATION_TYPES } from "@/lib/catalog/params"

export type DiscoverQueryInput = {
  region: string
  providerIds: number[]
  page: number
  mediaType: "movie" | "tv"
  monetizationTypes?: MonetizationType[]
  genreId?: number
  year?: number
  sort?: CatalogSort
}

export const buildDiscoverQuery = (input: DiscoverQueryInput) => {
  const region = input.region.trim().toUpperCase()

  if (!isIsoCountry(region)) {
    throw new Error("Região obrigatória")
  }

  const providerIds = [...new Set(input.providerIds)].filter((id) => {
    return Number.isInteger(id) && id > 0
  })

  if (providerIds.length === 0) {
    throw new Error("Pelo menos um provedor é obrigatório")
  }

  const page = Number.isInteger(input.page) && input.page > 0 ? input.page : 1
  const monetization = input.monetizationTypes?.length
    ? input.monetizationTypes
    : [...MONETIZATION_TYPES]
  const sort = input.sort ?? "popularity"

  const query: Record<string, string> = {
    language: "pt-BR",
    include_adult: "false",
    watch_region: region,
    with_watch_providers: providerIds.join("|"),
    with_watch_monetization_types: monetization.join("|"),
    page: String(page),
    sort_by: sortByFor(sort, input.mediaType),
  }

  if (input.genreId) {
    query.with_genres = String(input.genreId)
  }

  if (input.year) {
    if (input.mediaType === "movie") {
      query.primary_release_year = String(input.year)
    } else {
      query.first_air_date_year = String(input.year)
    }
  }

  return query
}

const sortByFor = (sort: CatalogSort, mediaType: "movie" | "tv") => {
  if (sort === "vote") return "vote_average.desc"
  if (sort === "date") {
    return mediaType === "movie" ? "primary_release_date.desc" : "first_air_date.desc"
  }
  return "popularity.desc"
}
