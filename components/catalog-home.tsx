"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { CatalogFilters } from "@/components/catalog-filters"
import { CatalogGrid, CatalogSkeleton } from "@/components/catalog-grid"
import { HeroCarousel } from "@/components/hero-carousel"
import { StatusPanel } from "@/components/status-panel"
import { useScreenNavigate } from "@/hooks/use-screen-navigate"
import { GUEST_PREFERENCES } from "@/lib/account/types"
import {
  fetchCatalog,
  fetchMeta,
  fetchProviders,
  peekCatalog,
  peekMeta,
  peekProviders,
} from "@/lib/api"
import { heroCatalogParams } from "@/lib/catalog/hero-params"
import { homeCatalogParams } from "@/lib/catalog/home-query"
import { pickHeroItems } from "@/lib/catalog/trending"
import { dedupeItems } from "@/lib/catalog/merge"
import type { CatalogItem, MergedGenre, WatchProvider } from "@/lib/catalog/types"
import { cn } from "@/lib/cn"
import { HOME_STAGGER_MS, prefersReducedMotion } from "@/lib/motion"

const heroPreferences = (region: string) => {
  return { country: region, providerIds: [] as number[] }
}

const sameItems = (left: CatalogItem[], right: CatalogItem[]) => {
  if (left.length !== right.length) return false
  return left.every((item, index) => {
    const other = right[index]
    if (!other) return false
    return item.mediaType === other.mediaType && item.tmdbId === other.tmdbId
  })
}

export const CatalogHome = () => {
  const searchParams = useSearchParams()
  const { preferences } = useAccount()
  const { leaveTo } = useScreenNavigate()
  const catalogPreferences = preferences ?? GUEST_PREFERENCES
  const hasOwnServices = catalogPreferences.providerIds.length > 0
  const queryKey = searchParams.toString()
  const region = catalogPreferences.country
  const providerKey = catalogPreferences.providerIds.join(",")
  const cachedMeta = peekMeta()
  const cachedProviders = peekProviders(region)
  const cachedHero = peekCatalog(heroPreferences(region), heroCatalogParams())
  const cachedCatalog = cachedMeta
    ? peekCatalog(
        catalogPreferences,
        homeCatalogParams(new URLSearchParams(queryKey), cachedMeta.genres, 1),
      )
    : null
  const [genres, setGenres] = useState<MergedGenre[]>(cachedMeta?.genres ?? [])
  const [providers, setProviders] = useState<WatchProvider[]>(cachedProviders?.providers ?? [])
  const [items, setItems] = useState<CatalogItem[]>(cachedCatalog?.items ?? [])
  const [featured, setFeatured] = useState<CatalogItem[]>(
    cachedHero ? pickHeroItems(cachedHero.items) : [],
  )
  const [page, setPage] = useState(cachedCatalog?.page ?? 1)
  const [totalPages, setTotalPages] = useState(cachedCatalog?.totalPages ?? 1)
  const [loading, setLoading] = useState(!cachedCatalog)
  const [heroLoading, setHeroLoading] = useState(!cachedHero)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [staggerDone, setStaggerDone] = useState(false)
  const staggerTimerRef = useRef<number | null>(null)

  const ownProviders = useMemo(() => {
    const allowed = new Set(catalogPreferences.providerIds)
    return providers.filter((provider) => allowed.has(provider.id))
  }, [catalogPreferences.providerIds, providers])

  useEffect(() => {
    let cancelled = false
    const heroQuery = heroPreferences(region)

    const loadHero = async () => {
      if (!peekCatalog(heroQuery, heroCatalogParams())) {
        setHeroLoading(true)
      }

      try {
        const data = await fetchCatalog(heroQuery, heroCatalogParams())
        if (cancelled) return
        const next = pickHeroItems(data.items)
        setFeatured((current) => (sameItems(current, next) ? current : next))
      } catch {
        if (!cancelled) {
          setFeatured((current) => (current.length > 0 ? current : []))
        }
      } finally {
        if (!cancelled) setHeroLoading(false)
      }
    }

    void loadHero()
    return () => {
      cancelled = true
    }
  }, [region])

  useEffect(() => {
    let cancelled = false
    const catalogQuery = {
      country: region,
      providerIds: providerKey.split(",").filter(Boolean).map(Number),
    }

    const load = async () => {
      const knownMeta = peekMeta()
      const knownCatalog = knownMeta
        ? peekCatalog(
            catalogQuery,
            homeCatalogParams(new URLSearchParams(queryKey), knownMeta.genres, 1),
          )
        : null
      if (!knownCatalog) {
        setLoading(true)
      }
      setError(null)

      try {
        const [meta, providerData] = await Promise.all([
          fetchMeta(),
          fetchProviders(region),
        ])
        if (cancelled) return

        setGenres((current) => (current === meta.genres ? current : meta.genres))
        setProviders((current) =>
          current === providerData.providers ? current : providerData.providers,
        )

        const data = await fetchCatalog(
          catalogQuery,
          homeCatalogParams(new URLSearchParams(queryKey), meta.genres, 1),
        )
        if (cancelled) return

        setItems((current) => (sameItems(current, data.items) ? current : data.items))
        setPage((current) => (current === data.page ? current : data.page))
        setTotalPages((current) => (current === data.totalPages ? current : data.totalPages))
      } catch (loadError) {
        if (!cancelled) {
          setItems((current) => (current.length > 0 ? current : []))
          if (!knownCatalog) {
            setError(loadError instanceof Error ? loadError.message : "Não deu para carregar o catálogo")
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [providerKey, queryKey, region])

  const stagger = !staggerDone

  useEffect(() => {
    if (staggerDone) return
    if (prefersReducedMotion()) {
      setStaggerDone(true)
      return
    }

    staggerTimerRef.current = window.setTimeout(() => {
      staggerTimerRef.current = null
      setStaggerDone(true)
    }, HOME_STAGGER_MS)

    return () => {
      if (staggerTimerRef.current !== null) {
        window.clearTimeout(staggerTimerRef.current)
        staggerTimerRef.current = null
      }
    }
  }, [staggerDone])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    setError(null)
    try {
      const data = await fetchCatalog(
        catalogPreferences,
        homeCatalogParams(searchParams, genres, page + 1),
      )
      setItems((current) => dedupeItems([...current, ...data.items]))
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não deu para carregar mais títulos")
    } finally {
      setLoadingMore(false)
    }
  }

  const handleRetry = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCatalog(catalogPreferences, homeCatalogParams(searchParams, genres, 1))
      setItems(data.items)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não deu para carregar o catálogo")
    } finally {
      setLoading(false)
    }
  }

  const showHero = featured.length > 0
  const needsNavOffset = !heroLoading && featured.length === 0

  return (
    <div className={cn(needsNavOffset && "sm:pt-chrome")}>
      {heroLoading && featured.length === 0 ? (
        <div className="hero-frame bg-white/4" aria-hidden />
      ) : null}
      {showHero ? (
        <HeroCarousel
          key={featured.map((item) => `${item.mediaType}-${item.tmdbId}`).join("|")}
          items={featured}
          onNavigate={leaveTo}
        />
      ) : null}

      <div className="mx-auto max-w-[1280px] px-5 pt-[26px] pb-[60px] sm:px-12">
        <CatalogFilters
          genres={genres}
          providers={ownProviders}
          showProviderFilter={hasOwnServices}
          resultCount={loading ? undefined : items.length}
          enter={stagger}
        />
        {loading ? <CatalogSkeleton /> : null}

        {!loading && error ? (
          <StatusPanel
            title="O catálogo não carregou"
            message={error}
            action={
              <button
                type="button"
                onClick={handleRetry}
                className="cta-primary inline-flex items-center rounded-full px-[22px] py-3 text-sm font-bold"
              >
                Tentar de novo
              </button>
            }
          />
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <p className="py-[70px] text-center text-[14.5px] text-white/50">
            Nada por aqui com esses filtros. Tente afrouxar algum deles.
          </p>
        ) : null}

        {!loading && items.length > 0 ? (
          <div
            className={stagger ? "d-in" : undefined}
            style={stagger ? { animationDelay: "0.42s" } : undefined}
          >
            <CatalogGrid
              items={items}
              showOffServiceHint={hasOwnServices}
              stagger={stagger}
              onNavigate={leaveTo}
            />
            {page < totalPages ? (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className={cn(
                  "cta-secondary mx-auto mt-10 flex w-fit items-center rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-40",
                )}
              >
                {loadingMore ? "Carregando…" : "Carregar mais"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
