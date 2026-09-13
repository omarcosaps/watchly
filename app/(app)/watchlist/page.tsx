"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { ScreenLink } from "@/components/screen-link"
import { useToast } from "@/components/toast-provider"
import { WatchStatusToggle } from "@/components/watch-status-toggle"
import { useEnterCascade } from "@/hooks/use-enter-cascade"
import { PRODUCT_COUNTRIES } from "@/lib/account/types"
import { fetchJson, preferenceQuery } from "@/lib/api"
import type { CatalogItem } from "@/lib/catalog/types"
import { cn } from "@/lib/cn"
import { mediaLabel, tipoFromMedia } from "@/lib/media"
import { cardEnterDelay } from "@/lib/motion"
import { posterUrl } from "@/lib/tmdb/image"

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
  const { watchlist, preferences, removeFromWatchlist } = useAccount()
  const { showToast } = useToast()
  const enter = useEnterCascade()
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

  const handleRemove = async (item: CatalogItem) => {
    try {
      await removeFromWatchlist(item.mediaType, item.tmdbId)
      showToast(`Removido da minha lista: ${item.title}`)
    } catch {
      showToast("Não deu para remover da lista")
    }
  }

  if (watchlist.length === 0) {
    return (
      <div className="mx-auto max-w-[880px]">
        <h1
          className={cn("mb-1 text-[34px] font-black tracking-[-0.03em]", enter && "d-in")}
        >
          Minha lista
        </h1>
        <div
          className={cn("py-[60px] text-center text-[14.5px] text-white/50", enter && "d-in")}
          style={enter ? { animationDelay: "0.06s" } : undefined}
        >
          <p className="mb-4">Sua lista está vazia.</p>
          <ScreenLink
            href="/"
            className="cta-primary inline-flex items-center rounded-full px-[22px] py-3 text-sm font-bold"
          >
            Explorar o catálogo
          </ScreenLink>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[880px]">
      <h1 className={cn("mb-1 text-[34px] font-black tracking-[-0.03em]", enter && "d-in")}>
        Minha lista
      </h1>
      <p
        className={cn("mb-[18px] text-sm text-white/50", enter && "d-in")}
        style={enter ? { animationDelay: "0.06s" } : undefined}
      >
        {watchlist.length} {watchlist.length === 1 ? "título salvo" : "títulos salvos"} ·
        disponibilidade em {countryName}
      </p>
      {error ? (
        <p className="mb-4 text-[13.5px] text-alert" role="alert">
          {error}
        </p>
      ) : null}
      {loading && items.length === 0 ? (
        <p className="text-[13.5px] text-mute">Carregando disponibilidade…</p>
      ) : null}
      <ul className="flex flex-col gap-3">
        {visible.map((item, index) => {
          const src = posterUrl(item.posterPath)
          const href = `/titulo/${tipoFromMedia(item.mediaType)}/${item.tmdbId}`
          const meta = item.year
            ? `${item.year} · ${mediaLabel(item.mediaType)}`
            : mediaLabel(item.mediaType)
          const availability = availabilityLine(item, countryName)

          return (
            <li
              key={`${item.mediaType}-${item.tmdbId}`}
              className={cn(
                "flex flex-wrap items-center gap-[18px] rounded-[14px] bg-white/4 py-3 pr-4 pl-3 transition-colors duration-[150ms] hover:bg-white/7",
                enter && "d-in",
              )}
              style={enter ? { animationDelay: cardEnterDelay(index) } : undefined}
            >
              <ScreenLink href={href} className="relative aspect-[2/3] w-[62px] flex-none overflow-hidden rounded-[10px] bg-[#15161c]">
                {src ? (
                  <Image src={src} alt="" fill sizes="62px" className="object-cover" />
                ) : (
                  <div className="hatch absolute inset-0" />
                )}
              </ScreenLink>
              <ScreenLink href={href} className="min-w-0 flex-1">
                <p className="text-[15.5px] font-bold">{item.title}</p>
                <p className="mt-[3px] text-xs text-mute">{meta}</p>
                <p className={`mt-1.5 text-[12.5px] ${availability.color}`}>{availability.label}</p>
              </ScreenLink>
              <WatchStatusToggle
                mediaType={item.mediaType}
                tmdbId={item.tmdbId}
                variant="compact"
              />
              <button
                type="button"
                onClick={() => {
                  void handleRemove(item)
                }}
                title="Remover"
                aria-label={`Remover ${item.title} da lista`}
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white/7 text-[15px] leading-none text-white/70 transition-colors duration-[150ms] hover:bg-[oklch(0.5_0.14_25/0.35)] hover:text-white"
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const availabilityLine = (item: CatalogItem, countryName: string) => {
  if (item.onOwnServices) {
    const names = item.offers
      .filter((offer) => offer.isOwn)
      .map((offer) => offer.providerName)
      .filter((name, index, names) => names.indexOf(name) === index)
      .join(" · ")
    return {
      label: names ? `Disponível em ${names}` : "Disponível nos provedores do país",
      color: "text-positive",
    }
  }

  if (item.offers.length > 0) {
    const names = item.offers
      .map((offer) => offer.providerName)
      .filter((name, index, names) => names.indexOf(name) === index)
      .join(" · ")
    return {
      label: `Fora dos seus serviços — ${names}`,
      color: "text-white/55",
    }
  }

  return {
    label: `Sem oferta em ${countryName} no momento`,
    color: "text-alert",
  }
}
