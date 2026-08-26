import type { MonetizationType } from "@/lib/catalog/params"
import type { MediaType } from "@/lib/media"

export type Offer = {
  providerId: number
  providerName: string
  logoPath: string | null
  monetization: MonetizationType
  isOwn: boolean
}

export type CatalogItem = {
  tmdbId: number
  mediaType: MediaType
  title: string
  posterPath: string | null
  backdropPath: string | null
  year: number | null
  popularity: number
  voteAverage: number
  date: string | null
  offers: Offer[]
  onOwnServices: boolean
}

export type CatalogPage = {
  page: number
  totalPages: number
  items: CatalogItem[]
}

export type MergedGenre = {
  name: string
  movieId?: number
  tvId?: number
}

export type WatchProvider = {
  id: number
  name: string
  logoPath: string | null
}

export type CountryOption = {
  code: string
  name: string
}

export type Credit = {
  id: number
  name: string
  character: string
  profilePath: string | null
}

export type TitleDetails = {
  tmdbId: number
  mediaType: MediaType
  title: string
  originalTitle: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  year: number | null
  runtimeMinutes: number | null
  genres: string[]
  voteAverage: number
  tmdbUrl: string
  credits: Credit[]
  offers: Offer[]
  availableInRegion: boolean
}

export const MONETIZATION_LABEL: Record<MonetizationType, string> = {
  flatrate: "Incluso",
  free: "Grátis",
  ads: "Com anúncios",
  rent: "Aluguel",
  buy: "Compra",
}

export const MONETIZATION_STAMP: Record<MonetizationType, string> = {
  flatrate: "Incluso",
  free: "Grátis",
  ads: "Anúncios",
  rent: "Aluga",
  buy: "Compra",
}

export const yearFromDate = (value: string | undefined) => {
  if (!value || value.length < 4) return null
  const year = Number.parseInt(value.slice(0, 4), 10)
  return Number.isInteger(year) ? year : null
}
