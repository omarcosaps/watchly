export const MONETIZATION_TYPES = ["flatrate", "free", "ads", "rent", "buy"] as const

export type MonetizationType = (typeof MONETIZATION_TYPES)[number]

export type CatalogSort = "popularity" | "vote" | "date"

export type MediaFilter = "all" | "movie" | "tv"

export type CatalogQuery = {
  region: string
  providerIds: number[]
  page: number
  media: MediaFilter
  monetizationTypes: MonetizationType[]
  genreMovieId?: number
  genreTvId?: number
  year?: number
  sort: CatalogSort
  filteredProviderIds?: number[]
}

export const isIsoCountry = (value: string) => {
  return /^[A-Z]{2}$/.test(value)
}

export const parseProviderIds = (value: string | null) => {
  if (!value) return []

  return value
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((id) => Number.isInteger(id) && id > 0)
}

export const parseMonetization = (value: string | null): MonetizationType[] => {
  if (!value) return [...MONETIZATION_TYPES]

  const requested = value
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is MonetizationType => {
      return (MONETIZATION_TYPES as readonly string[]).includes(part)
    })

  if (requested.length === 0) return [...MONETIZATION_TYPES]
  return requested
}

export const parseSort = (value: string | null): CatalogSort => {
  if (value === "vote" || value === "date" || value === "popularity") return value
  return "popularity"
}

export const parseMediaFilter = (value: string | null): MediaFilter => {
  if (value === "movie" || value === "tv") return value
  return "all"
}

export const parsePage = (value: string | null) => {
  const page = Number.parseInt(value ?? "1", 10)
  if (!Number.isInteger(page) || page < 1) return 1
  return page
}

export const parseOptionalYear = (value: string | null) => {
  if (!value) return undefined
  const year = Number.parseInt(value, 10)
  if (!Number.isInteger(year) || year < 1900 || year > 2100) return undefined
  return year
}

export const parseOptionalInt = (value: string | null) => {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined
  return parsed
}
