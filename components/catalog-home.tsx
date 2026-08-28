"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { useAppShell } from "@/components/app-shell-context"
import { CatalogFilters } from "@/components/catalog-filters"
import { CatalogGrid } from "@/components/catalog-grid"
import { HeroCarousel } from "@/components/hero-carousel"
import { HomeAside } from "@/components/home-aside"
import { PosterCard } from "@/components/poster-card"
import { StatusPanel } from "@/components/status-panel"
import { fetchCatalog, fetchMeta, fetchProviders } from "@/lib/api"
import { dedupeItems } from "@/lib/catalog/merge"
import type { CatalogItem, MergedGenre, WatchProvider } from "@/lib/catalog/types"
import { ChevronIcon } from "@/components/icons"
import { cn } from "@/lib/cn"

const catalogParams = (
  searchParams: URLSearchParams,
  genres: MergedGenre[],
  page: number,
) => {
  const params = new URLSearchParams()
  params.set("page", String(page))

  const media = searchParams.get("media")
  const monetization = searchParams.get("monetization")
  const filterProviders = searchParams.get("filterProviders")
  const year = searchParams.get("year")
  const sort = searchParams.get("sort")
  const selectedGenre = genres.find((genre) => genre.name === searchParams.get("genre"))

  if (media) params.set("media", media)
  if (monetization) params.set("monetization", monetization)
  if (filterProviders) params.set("filterProviders", filterProviders)
  if (year) params.set("year", year)
  if (sort) params.set("sort", sort)
  if (selectedGenre?.movieId) params.set("genreMovie", String(selectedGenre.movieId))
  if (selectedGenre?.tvId) params.set("genreTv", String(selectedGenre.tvId))

  return params
}

export const CatalogHome = () => {
  const searchParams = useSearchParams()
  const { preferences } = useAccount()
  const { filtersOpen, setFiltersOpen } = useAppShell()
  const [genres, setGenres] = useState<MergedGenre[]>([])
  const [providers, setProviders] = useState<WatchProvider[]>([])
  const [items, setItems] = useState<CatalogItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryKey = searchParams.toString()

  const ownProviders = useMemo(() => {
    const allowed = new Set(preferences?.providerIds ?? [])
    return providers.filter((provider) => allowed.has(provider.id))
  }, [preferences?.providerIds, providers])

  const featured = items.slice(0, 5)
  const popular = items.slice(0, 8)
  const gridItems = items.slice(8)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!preferences) return
      setLoading(true)
      setError(null)

      try {
        const [meta, providerData] = await Promise.all([
          fetchMeta(),
          fetchProviders(preferences.country),
        ])
        if (cancelled) return

        setGenres(meta.genres)
        setProviders(providerData.providers)

        const data = await fetchCatalog(
          preferences,
          catalogParams(searchParams, meta.genres, 1),
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
  }, [preferences, queryKey, searchParams])

  const handleLoadMore = async () => {
    if (!preferences) return
    setLoadingMore(true)
    setError(null)
    try {
      const data = await fetchCatalog(
        preferences,
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
    if (!preferences) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCatalog(preferences, catalogParams(searchParams, genres, 1))
      setItems(data.items)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não deu para carregar o catálogo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 xl:flex-row">
      <div className="min-w-0 flex-1">
        <div
          id="filtros-catalogo"
          className={cn(
            "grid transition-[grid-template-rows,opacity,margin] duration-ui ease",
            filtersOpen
              ? "mb-6 grid-rows-[1fr] opacity-100"
              : "pointer-events-none mb-0 grid-rows-[0fr] opacity-0",
          )}
          aria-hidden={!filtersOpen}
          inert={!filtersOpen ? true : undefined}
        >
          <div className="min-h-0 overflow-hidden">
            <CatalogFilters
              genres={genres}
              providers={ownProviders}
              onClose={() => setFiltersOpen(false)}
            />
          </div>
        </div>

        {loading ? <HomeSkeleton /> : null}

        {!loading && error ? (
          <StatusPanel
            title="O catálogo não carregou"
            message={error}
            action={
              <button
                type="button"
                onClick={handleRetry}
                className="cta-ember inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold"
              >
                Tentar de novo
              </button>
            }
          />
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <StatusPanel
            title="Nada com esses filtros"
            message="Solte um filtro ou limpe tudo para ver de novo os títulos dos seus streamings."
            action={
              <Link
                href="/"
                className="cta-ember inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold"
              >
                Limpar filtros
              </Link>
            }
          />
        ) : null}

        {!loading && featured.length > 0 ? <HeroCarousel items={featured} /> : null}

        {!loading && popular.length > 0 ? (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-paper">Popular no Watchly</h2>
              <p className="hidden items-center gap-1 text-xs text-mist sm:flex">
                Deslize
                <ChevronIcon className="h-3.5 w-3.5" />
              </p>
            </div>
            <div className="hide-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
              {popular.map((item) => (
                <PosterCard key={`${item.mediaType}-${item.tmdbId}`} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        {!loading && gridItems.length > 0 ? (
          <section className="mt-10">
            <h2 className="mb-5 text-lg font-semibold text-paper">Mais títulos</h2>
            <CatalogGrid items={gridItems} />
            {page < totalPages ? (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="glass press-pill mx-auto mt-10 flex h-12 w-fit items-center rounded-full px-6 text-sm text-paper disabled:opacity-40"
              >
                {loadingMore ? "Carregando…" : "Carregar mais"}
              </button>
            ) : null}
          </section>
        ) : null}
      </div>
      {!loading && items.length > 0 ? <HomeAside items={items} genres={genres} /> : null}
    </div>
  )
}

const HomeSkeleton = () => {
  return (
    <div aria-hidden>
      <div className="min-h-[22rem] rounded-[28px] bg-panel md:min-h-[28rem]" />
      <div className="mt-8 flex gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="aspect-[2/3] w-[13.5rem] shrink-0 rounded-[22px] bg-panel sm:w-[15.5rem]" />
        ))}
      </div>
    </div>
  )
}
