import "server-only"

import { extractOffers } from "@/lib/catalog/offers"
import { pickYoutubeTrailer, pickYoutubeTrailerKey } from "@/lib/catalog/trailer"
import type { TitleDetails } from "@/lib/catalog/types"
import { yearFromDate } from "@/lib/catalog/types"
import type { MediaType } from "@/lib/media"
import {
  getMovieCredits,
  getMovieDetails,
  getMovieVideos,
  getMovieWatchProviders,
  getTvCredits,
  getTvDetails,
  getTvVideos,
  getTvWatchProviders,
} from "@/lib/tmdb/queries"

export const getTitleDetails = async (input: {
  mediaType: MediaType
  tmdbId: number
  region: string
  providerIds: number[]
}): Promise<TitleDetails> => {
  if (input.mediaType === "movie") {
    const [details, credits, providers, videos] = await Promise.all([
      getMovieDetails(input.tmdbId),
      getMovieCredits(input.tmdbId),
      getMovieWatchProviders(input.tmdbId),
      getMovieVideos(input.tmdbId),
    ])

    const offers = extractOffers(providers.results[input.region], input.providerIds, false)

    return {
      tmdbId: details.id,
      mediaType: "movie",
      title: details.title,
      originalTitle: details.original_title,
      overview: details.overview ?? "",
      posterPath: details.poster_path,
      backdropPath: details.backdrop_path,
      year: yearFromDate(details.release_date),
      runtimeMinutes: details.runtime,
      genres: details.genres.map((genre) => genre.name),
      voteAverage: details.vote_average,
      tmdbUrl: `https://www.themoviedb.org/movie/${details.id}?language=pt-BR`,
      credits: credits.cast.slice(0, 8).map((person) => ({
        id: person.id,
        name: person.name,
        character: person.character,
        profilePath: person.profile_path,
      })),
      offers,
      availableInRegion: offers.length > 0,
      trailerUrl: pickYoutubeTrailer(videos.results),
      trailerKey: pickYoutubeTrailerKey(videos.results),
    }
  }

  const [details, credits, providers, videos] = await Promise.all([
    getTvDetails(input.tmdbId),
    getTvCredits(input.tmdbId),
    getTvWatchProviders(input.tmdbId),
    getTvVideos(input.tmdbId),
  ])

  const offers = extractOffers(providers.results[input.region], input.providerIds, false)

  return {
    tmdbId: details.id,
    mediaType: "tv",
    title: details.name,
    originalTitle: details.original_name,
    overview: details.overview ?? "",
    posterPath: details.poster_path,
    backdropPath: details.backdrop_path,
    year: yearFromDate(details.first_air_date),
    runtimeMinutes: details.episode_run_time[0] ?? null,
    genres: details.genres.map((genre) => genre.name),
    voteAverage: details.vote_average,
    tmdbUrl: `https://www.themoviedb.org/tv/${details.id}?language=pt-BR`,
    credits: credits.cast.slice(0, 8).map((person) => ({
      id: person.id,
      name: person.name,
      character: person.character,
      profilePath: person.profile_path,
    })),
    offers,
    availableInRegion: offers.length > 0,
    trailerUrl: pickYoutubeTrailer(videos.results),
    trailerKey: pickYoutubeTrailerKey(videos.results),
  }
}
