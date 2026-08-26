export type MediaType = "movie" | "tv"

export type TipoPath = "filme" | "serie"

export const tipoFromMedia = (mediaType: MediaType): TipoPath => {
  return mediaType === "movie" ? "filme" : "serie"
}

export const mediaFromTipo = (tipo: string): MediaType | null => {
  if (tipo === "filme") return "movie"
  if (tipo === "serie") return "tv"
  return null
}

export const mediaLabel = (mediaType: MediaType) => {
  return mediaType === "movie" ? "Filme" : "Série"
}
