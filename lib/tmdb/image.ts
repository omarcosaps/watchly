const FALLBACK_BASE = "https://image.tmdb.org/t/p/"

export const posterUrl = (posterPath: string | null, size = "w342") => {
  if (!posterPath) return null
  return `${FALLBACK_BASE}${size}${posterPath}`
}

export const backdropUrl = (backdropPath: string | null, size = "w1280") => {
  if (!backdropPath) return null
  return `${FALLBACK_BASE}${size}${backdropPath}`
}

export const atmosphereUrl = (
  backdropPath: string | null,
  posterPath: string | null,
) => {
  return backdropUrl(backdropPath) ?? posterUrl(posterPath, "w780")
}

export const profileUrl = (profilePath: string | null, size = "w185") => {
  if (!profilePath) return null
  return `${FALLBACK_BASE}${size}${profilePath}`
}

export const logoUrl = (logoPath: string | null, size = "w92") => {
  if (!logoPath) return null
  return `${FALLBACK_BASE}${size}${logoPath}`
}
