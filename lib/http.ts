import { TmdbError } from "@/lib/tmdb/types"

export const jsonError = (error: unknown) => {
  if (error instanceof TmdbError) {
    const status = error.status === 401 ? 502 : error.status
    return Response.json({ error: error.message }, { status })
  }

  if (error instanceof Error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json({ error: "Algo deu errado" }, { status: 500 })
}

export const requireRegion = (value: string | null) => {
  const region = (value ?? "").trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(region)) {
    throw new Error("Região obrigatória")
  }
  return region
}
