"use client"

import Link from "next/link"

import { CatalogGrid } from "@/components/catalog-grid"
import { StatusPanel } from "@/components/status-panel"
import { useAccount } from "@/components/account-provider"
import { WatchStatusToggle } from "@/components/watch-status-toggle"
import { PRODUCT_COUNTRIES } from "@/lib/account/types"
import { fetchJson, preferenceQuery } from "@/lib/api"
import type { CatalogItem } from "@/lib/catalog/types"
import { useEffect, useRef, useState } from "react"

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
  const watchlistIdentity = watchlist
    .map((item) => `${item.mediaType}:${item.tmdbId}`)
    .join("|")
  const lastHydrateKey = useRef("")
  const countryName =
    PRODUCT_COUNTRIES.find((country) => country.code === preferences?.country)?.name ??
    preferences?.country ??
    "Brasil"

  useEffect(() => {
    if (!preferences) return

    const hydrateKey = `${preferenceQuery(preferences)}:${watchlistIdentity}`
    if (lastHydrateKey.current === hydrateKey) return

    let cancelled = false

    const load = async () => {
      if (watchlist.length === 0) {
        lastHydrateKey.current = hydrateKey
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
              offers: details.offers,
              onOwnServices: details.offers.some((offer) => offer.isOwn),
            })
          }),
        )

        if (!cancelled) {
          lastHydrateKey.current = hydrateKey
          setItems(hydrated)
        }
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
  }, [preferences, watchlist, watchlistIdentity])

  const visible = items.length > 0 ? items : watchlist.map((saved) => toCatalogItem(saved))

  if (watchlist.length === 0) {
    return (
      <StatusPanel
        title="Sua lista está vazia."
        message="Guarde filmes e séries para acompanhar o que você quer assistir."
        action={
          <Link
            href="/"
            className="cta-primary inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold"
          >
            Explorar o catálogo
          </Link>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-paper">Minha lista</h1>
        <p className="mt-2 text-sm text-mist">
          {watchlist.length} {watchlist.length === 1 ? "título salvo" : "títulos salvos"} ·
          disponibilidade em {countryName}
        </p>
      </div>
      {error ? (
        <p className="text-paper" role="alert">
          {error}
        </p>
      ) : null}
      {loading && items.length === 0 ? <p className="text-mist">Carregando disponibilidade…</p> : null}
      <CatalogGrid
        items={visible}
        showOffServiceHint
        posterStamp={(item) => (
          <WatchStatusToggle mediaType={item.mediaType} tmdbId={item.tmdbId} />
        )}
      />
    </div>
  )
}
