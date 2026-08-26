import "server-only"

import type { CountryOption, MergedGenre, WatchProvider } from "@/lib/catalog/types"
import {
  getCountries,
  getMovieGenres,
  getMovieProviders,
  getTvGenres,
  getTvProviders,
} from "@/lib/tmdb/queries"
import type { TmdbProvider } from "@/lib/tmdb/types"

export const getCountriesList = async (): Promise<CountryOption[]> => {
  const countries = await getCountries()

  return countries
    .map((country) => ({
      code: country.iso_3166_1,
      name:
        country.iso_3166_1 === "BR"
          ? "Brasil"
          : country.native_name || country.english_name,
    }))
    .sort((a, b) => {
      if (a.code === "BR") return -1
      if (b.code === "BR") return 1
      return a.name.localeCompare(b.name, "pt-BR")
    })
}

export const getMergedGenres = async (): Promise<MergedGenre[]> => {
  const [movieGenres, tvGenres] = await Promise.all([getMovieGenres(), getTvGenres()])
  const byName = new Map<string, MergedGenre>()

  movieGenres.forEach((genre) => {
    byName.set(genre.name, { name: genre.name, movieId: genre.id })
  })

  tvGenres.forEach((genre) => {
    const existing = byName.get(genre.name)
    if (existing) {
      existing.tvId = genre.id
      return
    }
    byName.set(genre.name, { name: genre.name, tvId: genre.id })
  })

  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
}

export const getRegionProviders = async (region: string): Promise<WatchProvider[]> => {
  const [movie, tv] = await Promise.all([getMovieProviders(region), getTvProviders(region)])
  return mergeProviders([...movie, ...tv])
}

const mergeProviders = (providers: TmdbProvider[]): WatchProvider[] => {
  const byId = new Map<number, TmdbProvider>()

  providers.forEach((provider) => {
    const existing = byId.get(provider.provider_id)
    if (!existing || provider.display_priority < existing.display_priority) {
      byId.set(provider.provider_id, provider)
    }
  })

  return [...byId.values()]
    .sort((a, b) => a.display_priority - b.display_priority)
    .map((provider) => ({
      id: provider.provider_id,
      name: provider.provider_name,
      logoPath: provider.logo_path,
    }))
}
