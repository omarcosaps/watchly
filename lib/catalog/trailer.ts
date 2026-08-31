import type { TmdbVideo } from "@/lib/tmdb/types"

export const youtubeTrailerUrl = (key: string) => {
  return `https://www.youtube.com/watch?v=${key}`
}

export const youtubeEmbedUrl = (key: string) => {
  return `https://www.youtube-nocookie.com/embed/${key}`
}

export const pickYoutubeTrailerKey = (videos: TmdbVideo[]): string | null => {
  const youtube = videos.filter((video) => {
    return video.site === "YouTube" && video.key.trim() !== ""
  })

  const officialTrailer = youtube.find((video) => {
    return video.type === "Trailer" && video.official
  })
  const trailer = youtube.find((video) => video.type === "Trailer")
  const teaser = youtube.find((video) => video.type === "Teaser")
  const chosen = officialTrailer ?? trailer ?? teaser

  return chosen?.key ?? null
}

export const pickYoutubeTrailer = (videos: TmdbVideo[]): string | null => {
  const key = pickYoutubeTrailerKey(videos)
  return key ? youtubeTrailerUrl(key) : null
}
