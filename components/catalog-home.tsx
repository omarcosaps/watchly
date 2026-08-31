"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { useAppShell } from "@/components/app-shell-context"
import { CatalogFilters } from "@/components/catalog-filters"
import { CatalogGrid, CatalogSkeleton } from "@/components/catalog-grid"
import { HeroCarousel } from "@/components/hero-carousel"
import { HomeAside } from "@/components/home-aside"
import { StatusPanel } from "@/components/status-panel"
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
  const gridItems = items.slice(5)

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
    <div>
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

      <div className="flex flex-col gap-8">
        {loading ? <HomeSkeleton /> : null}

        {!loading && error ? (
          <StatusPanel
            title="O catálogo não carregou"
            message={error}
            action={
              <button
                type="button"
                onClick={handleRetry}
                className="cta-primary inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold"
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
                className="cta-primary inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold"
              >
                Limpar filtros
              </Link>
            }
          />
        ) : null}

        {!loading && featured.length > 0 ? <HeroCarousel items={featured} /> : null}

        {!loading && items.length > 0 ? (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_19.5rem]">
            <div className="min-w-0">
              {gridItems.length > 0 ? <CatalogGrid items={gridItems} /> : null}
              {page < totalPages ? (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={cn(
                    "cta-ghost press-pill mx-auto flex h-12 w-fit items-center rounded-full px-6 text-sm font-semibold disabled:opacity-40",
                    gridItems.length > 0 && "mt-10",
                  )}
                >
                  {loadingMore ? "Carregando…" : "Carregar mais"}
                </button>
              ) : null}
            </div>
            <HomeAside items={items} genres={genres} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

const HomeSkeleton = () => {
  return (
    <div aria-hidden className="flex flex-col gap-8">
      <div className="min-h-[22rem] w-full rounded-[28px] bg-panel md:min-h-[28rem] lg:min-h-[32rem]" />
      <CatalogSkeleton />
    </div>
  )
}
