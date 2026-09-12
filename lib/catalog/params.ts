export const MONETIZATION_TYPES = ["flatrate", "free", "ads", "rent", "buy"] as const

export type MonetizationType = (typeof MONETIZATION_TYPES)[number]

export type CatalogSort = "popularity" | "vote" | "date" | "trending"

export type MediaFilter = "all" | "movie" | "tv"

export const YEAR_RANGES = ["2024-2025", "2020-2023", "2010-2019", "before-2010"] as const

export type YearRange = (typeof YEAR_RANGES)[number]

export type DateBounds = {
  gte?: string
  lte?: string
}

export type CatalogQuery = {
  region: string
  providerIds: number[]
  page: number
  media: MediaFilter
  monetizationTypes: MonetizationType[]
  genreMovieId?: number
  genreTvId?: number
  year?: number
  yearRange?: YearRange
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
  if (value === "vote" || value === "date" || value === "popularity" || value === "trending") {
    return value
  }
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

export const parseYearRange = (value: string | null): YearRange | undefined => {
  if (!value) return undefined
  if ((YEAR_RANGES as readonly string[]).includes(value)) {
    return value as YearRange
  }
  return undefined
}

export const dateBoundsForYearRange = (range: YearRange | undefined): DateBounds => {
  if (range === "2024-2025") return { gte: "2024-01-01", lte: "2025-12-31" }
  if (range === "2020-2023") return { gte: "2020-01-01", lte: "2023-12-31" }
  if (range === "2010-2019") return { gte: "2010-01-01", lte: "2019-12-31" }
  if (range === "before-2010") return { lte: "2009-12-31" }
  return {}
}

export const parseOptionalInt = (value: string | null) => {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined
  return parsed
}
