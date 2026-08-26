import "server-only"

import { tmdbFetch } from "@/lib/tmdb/client"
import type {
  TmdbConfiguration,
  TmdbCountry,
  TmdbCredits,
  TmdbGenre,
  TmdbMovieDetails,
  TmdbMovieListItem,
  TmdbPaginated,
  TmdbProvider,
  TmdbTvDetails,
  TmdbTvListItem,
  TmdbWatchProvidersResponse,
} from "@/lib/tmdb/types"

const CACHE = {
  configuration: 60 * 60 * 24,
  countries: 60 * 60 * 24,
  genres: 60 * 60 * 24,
  providers: 60 * 60 * 12,
  discover: 60 * 15,
  search: 60 * 15,
  details: 60 * 60 * 6,
  watchProviders: 60 * 60 * 6,
}

export const getConfiguration = () => {
  return tmdbFetch<TmdbConfiguration>("/configuration", {}, CACHE.configuration)
}

export const getCountries = () => {
  return tmdbFetch<TmdbCountry[]>("/configuration/countries", {}, CACHE.countries)
}

export const getMovieGenres = async () => {
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/movie/list", {}, CACHE.genres)
  return data.genres
}

export const getTvGenres = async () => {
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/tv/list", {}, CACHE.genres)
  return data.genres
}

export const getMovieProviders = async (region: string) => {
  const data = await tmdbFetch<{ results: TmdbProvider[] }>(
    "/watch/providers/movie",
    { watch_region: region },
    CACHE.providers,
  )
  return data.results
}

export const getTvProviders = async (region: string) => {
  const data = await tmdbFetch<{ results: TmdbProvider[] }>(
    "/watch/providers/tv",
    { watch_region: region },
    CACHE.providers,
  )
  return data.results
}

export const discoverMovies = (query: Record<string, string>) => {
  return tmdbFetch<TmdbPaginated<TmdbMovieListItem>>("/discover/movie", query, CACHE.discover)
}

export const discoverTv = (query: Record<string, string>) => {
  return tmdbFetch<TmdbPaginated<TmdbTvListItem>>("/discover/tv", query, CACHE.discover)
}

export const searchMovies = (query: string, page: number) => {
  return tmdbFetch<TmdbPaginated<TmdbMovieListItem>>(
    "/search/movie",
    { query, page: String(page), include_adult: "false" },
    CACHE.search,
  )
}

export const searchTv = (query: string, page: number) => {
  return tmdbFetch<TmdbPaginated<TmdbTvListItem>>(
    "/search/tv",
    { query, page: String(page), include_adult: "false" },
    CACHE.search,
  )
}

export const getMovieDetails = (id: number) => {
  return tmdbFetch<TmdbMovieDetails>(`/movie/${id}`, {}, CACHE.details)
}

export const getTvDetails = (id: number) => {
  return tmdbFetch<TmdbTvDetails>(`/tv/${id}`, {}, CACHE.details)
}

export const getMovieCredits = (id: number) => {
  return tmdbFetch<TmdbCredits>(`/movie/${id}/credits`, {}, CACHE.details)
}

export const getTvCredits = (id: number) => {
  return tmdbFetch<TmdbCredits>(`/tv/${id}/credits`, {}, CACHE.details)
}

export const getMovieWatchProviders = (id: number) => {
  return tmdbFetch<TmdbWatchProvidersResponse>(
    `/movie/${id}/watch/providers`,
    {},
    CACHE.watchProviders,
  )
}

export const getTvWatchProviders = (id: number) => {
  return tmdbFetch<TmdbWatchProvidersResponse>(
    `/tv/${id}/watch/providers`,
    {},
    CACHE.watchProviders,
  )
}
