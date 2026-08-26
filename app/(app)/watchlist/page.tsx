"use client"

import { CatalogGrid } from "@/components/catalog-grid"
import { StatusPanel } from "@/components/status-panel"
import { useAccount } from "@/components/account-provider"
import { fetchJson, preferenceQuery } from "@/lib/api"
import type { CatalogItem } from "@/lib/catalog/types"
import { useEffect, useState } from "react"

const toCatalogItem = (
  saved: {
    tmdbId: number
    mediaType: "movie" | "tv"
    title: string
    posterPath: string | null
    year: number | null
  },
  extras?: Partial<CatalogItem>,
): CatalogItem => {
  return {
    tmdbId: saved.tmdbId,
    mediaType: saved.mediaType,
    title: saved.title,
    posterPath: saved.posterPath,
    backdropPath: extras?.backdropPath ?? null,
    year: saved.year,
    popularity: 0,
    voteAverage: extras?.voteAverage ?? 0,
    date: null,
    offers: extras?.offers ?? [],
    onOwnServices: extras?.onOwnServices ?? false,
  }
}

export default function WatchlistPage() {
  const { watchlist, preferences } = useAccount()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!preferences) return
      if (watchlist.length === 0) {
        setItems([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const hydrated = await Promise.all(
          watchlist.map(async (saved) => {
            const tipo = saved.mediaType === "movie" ? "filme" : "serie"
            const details = await fetchJson<{
              tmdbId: number
              mediaType: "movie" | "tv"
              title: string
              posterPath: string | null
              backdropPath: string | null
              year: number | null
              voteAverage: number
              offers: CatalogItem["offers"]
              availableInRegion: boolean
            }>(`/api/title/${tipo}/${saved.tmdbId}?${preferenceQuery(preferences)}`)

            return toCatalogItem(saved, {
              backdropPath: details.backdropPath,
              voteAverage: details.voteAverage,
              offers: details.offers.filter((offer) => offer.isOwn),
              onOwnServices: details.offers.some((offer) => offer.isOwn),
            })
          }),
        )

        if (!cancelled) setItems(hydrated)
      } catch (loadError) {
        if (!cancelled) {
          setItems(watchlist.map((saved) => toCatalogItem(saved)))
          setError(loadError instanceof Error ? loadError.message : "Não deu para atualizar a disponibilidade")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [preferences, watchlist])

  const visible = items.length > 0 ? items : watchlist.map((saved) => toCatalogItem(saved))

  if (watchlist.length === 0) {
    return (
      <StatusPanel
        title="Nada guardado ainda"
        message="Abra um título e toque em Guardar. A lista fica na sua conta."
      />
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-sm text-mist">Sua lista</p>
        <h1 className="font-display mt-1 text-5xl italic tracking-tight text-paper">Watchlist</h1>
      </div>
      {error ? <p className="text-paper" role="alert">{error}</p> : null}
      {loading && items.length === 0 ? <p className="text-mist">Carregando disponibilidade…</p> : null}
      <CatalogGrid items={visible} />
    </div>
  )
}
