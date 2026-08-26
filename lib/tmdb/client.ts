import "server-only"

import { TmdbError } from "@/lib/tmdb/types"

const TMDB_BASE = "https://api.themoviedb.org/3"

export const tmdbFetch = async <T>(
  path: string,
  searchParams: Record<string, string | undefined> = {},
  revalidateSeconds: number,
): Promise<T> => {
  const token = process.env.TMDB_ACCESS_TOKEN

  if (!token) {
    throw new TmdbError(500, "Token da TMDB não configurado")
  }

  const url = new URL(`${TMDB_BASE}${path}`)

  if (!searchParams.language) {
    url.searchParams.set("language", "pt-BR")
  }

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value)
    }
  })

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    next: { revalidate: revalidateSeconds },
  })

  if (response.status === 401) {
    throw new TmdbError(401, "A TMDB recusou a consulta")
  }

  if (response.status === 404) {
    throw new TmdbError(404, "Título não encontrado")
  }

  if (response.status === 429) {
    throw new TmdbError(429, "Muitas consultas. Tente de novo em instantes")
  }

  if (!response.ok) {
    throw new TmdbError(response.status, "A TMDB falhou nesta consulta")
  }

  return response.json() as Promise<T>
}
