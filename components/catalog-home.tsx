"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { CatalogFilters } from "@/components/catalog-filters"
import { CatalogGrid, CatalogSkeleton } from "@/components/catalog-grid"
import { HeroCarousel } from "@/components/hero-carousel"
import { StatusPanel } from "@/components/status-panel"
import { GUEST_PREFERENCES } from "@/lib/account/types"
import { fetchCatalog, fetchMeta, fetchProviders } from "@/lib/api"
import { dedupeItems } from "@/lib/catalog/merge"
import type { CatalogItem, MergedGenre, WatchProvider } from "@/lib/catalog/types"
import { cn } from "@/lib/cn"

const catalogParams = (
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

export const CatalogHome = () => {
  const searchParams = useSearchParams()
  const { preferences } = useAccount()
  const catalogPreferences = preferences ?? GUEST_PREFERENCES
  const hasOwnServices = catalogPreferences.providerIds.length > 0
  const [genres, setGenres] = useState<MergedGenre[]>([])
  const [providers, setProviders] = useState<WatchProvider[]>([])
  const [items, setItems] = useState<CatalogItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryKey = searchParams.toString()
  const region = catalogPreferences.country
  const providerKey = catalogPreferences.providerIds.join(",")
  const featured = items.slice(0, 5)

  const ownProviders = useMemo(() => {
    const allowed = new Set(catalogPreferences.providerIds)
    return providers.filter((provider) => allowed.has(provider.id))
  }, [catalogPreferences.providerIds, providers])

  useEffect(() => {
    let cancelled = false
    const catalogQuery = {
      country: region,
      providerIds: providerKey.split(",").filter(Boolean).map(Number),
    }

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const [meta, providerData] = await Promise.all([
          fetchMeta(),
          fetchProviders(region),
        ])
        if (cancelled) return

        setGenres(meta.genres)
        setProviders(providerData.providers)

        const data = await fetchCatalog(
          catalogQuery,
          catalogParams(new URLSearchParams(queryKey), meta.genres, 1),
        )
        if (cancelled) return

        setItems(data.items)
        setPage(data.page)
        setTotalPages(data.totalPages)
      } catch (loadError) {
        if (!cancelled) {
          setItems([])
          setError(loadError instanceof Error ? loadError.message : "Não deu para carregar o catálogo")
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

  const handleLoadMore = async () => {
    setLoadingMore(true)
    setError(null)
    try {
      const data = await fetchCatalog(
        catalogPreferences,
        catalogParams(searchParams, genres, page + 1),
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
      const data = await fetchCatalog(catalogPreferences, catalogParams(searchParams, genres, 1))
      setItems(data.items)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não deu para carregar o catálogo")
    } finally {
      setLoading(false)
    }
  }

  const showHero = !loading && featured.length > 0
  const needsNavOffset = !loading && featured.length === 0

  return (
    <div className={cn(needsNavOffset && "pt-[110px]")}>
      {loading ? <div className="h-[64vh] min-h-[520px] bg-white/4" aria-hidden /> : null}
      {showHero ? (
        <HeroCarousel
          key={featured.map((item) => `${item.mediaType}-${item.tmdbId}`).join("|")}
          items={featured}
        />
      ) : null}

      <div className="mx-auto max-w-[1280px] px-5 pt-[26px] pb-[60px] sm:px-12">
        <CatalogFilters
          genres={genres}
          providers={ownProviders}
          showProviderFilter={hasOwnServices}
          resultCount={loading ? undefined : items.length}
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
          <div>
            <CatalogGrid items={items} showOffServiceHint={hasOwnServices} />
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
