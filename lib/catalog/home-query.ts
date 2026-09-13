import type { MergedGenre } from "@/lib/catalog/types"

export const homeCatalogParams = (
  searchParams: URLSearchParams,
  genres: MergedGenre[],
  page: number,
) => {
  const params = new URLSearchParams()
  params.set("page", String(page))

  const media = searchParams.get("media")
  const filterProviders = searchParams.get("filterProviders")
  const yearRange = searchParams.get("yearRange")
  const sort = searchParams.get("sort")
  const selectedGenre = genres.find((genre) => genre.name === searchParams.get("genre"))

  if (media) params.set("media", media)
  if (filterProviders) params.set("filterProviders", filterProviders)
  if (yearRange) params.set("yearRange", yearRange)
  if (sort) params.set("sort", sort)
  if (selectedGenre?.movieId) params.set("genreMovie", String(selectedGenre.movieId))
  if (selectedGenre?.tvId) params.set("genreTv", String(selectedGenre.tvId))

  return params
}
