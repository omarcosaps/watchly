export class TmdbError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "TmdbError"
  }
}

export type TmdbPaginated<T> = {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export type TmdbMovieListItem = {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  popularity: number
  vote_average: number
  genre_ids: number[]
  adult: boolean
}

export type TmdbTvListItem = {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  popularity: number
  vote_average: number
  genre_ids: number[]
  adult: boolean
}

export type TmdbGenre = {
  id: number
  name: string
}

export type TmdbCountry = {
  iso_3166_1: string
  english_name: string
  native_name: string
}

export type TmdbProvider = {
  provider_id: number
  provider_name: string
  logo_path: string | null
  display_priority: number
}

export type TmdbWatchOffer = {
  logo_path: string | null
  provider_id: number
  provider_name: string
  display_priority: number
}

export type TmdbRegionOffers = {
  link?: string
  flatrate?: TmdbWatchOffer[]
  free?: TmdbWatchOffer[]
  ads?: TmdbWatchOffer[]
  rent?: TmdbWatchOffer[]
  buy?: TmdbWatchOffer[]
}

export type TmdbWatchProvidersResponse = {
  id: number
  results: Record<string, TmdbRegionOffers>
}

export type TmdbConfiguration = {
  images: {
    secure_base_url: string
    poster_sizes: string[]
    profile_sizes: string[]
  }
}

export type TmdbCastMember = {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export type TmdbMovieDetails = TmdbMovieListItem & {
  runtime: number | null
  genres: TmdbGenre[]
  imdb_id: string | null
}

export type TmdbTvDetails = Omit<TmdbTvListItem, "genre_ids"> & {
  episode_run_time: number[]
  genres: TmdbGenre[]
  number_of_seasons: number
}

export type TmdbCredits = {
  cast: TmdbCastMember[]
}

export type TmdbVideo = {
  key: string
  site: string
  type: string
  official: boolean
}

export type TmdbVideosResponse = {
  id: number
  results: TmdbVideo[]
}
