"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { CatalogGrid, CatalogSkeleton } from "@/components/catalog-grid"
import { StatusPanel } from "@/components/status-panel"
import { GUEST_PREFERENCES } from "@/lib/account/types"
import { fetchSearch } from "@/lib/api"
import { dedupeItems } from "@/lib/catalog/merge"
import type { CatalogItem } from "@/lib/catalog/types"

const SearchResults = () => {
  const searchParams = useSearchParams()
  const query = (searchParams.get("q") ?? "").trim()
  const { preferences } = useAccount()
  const catalogPreferences = preferences ?? GUEST_PREFERENCES
  const hasOwnServices = (preferences?.providerIds.length ?? 0) > 0
  const [items, setItems] = useState<CatalogItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!query) {
        setItems([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await fetchSearch(catalogPreferences, query, 1)
        if (cancelled) return
        setItems(data.items)
        setPage(data.page)
        setTotalPages(data.totalPages)
      } catch (loadError) {
        if (!cancelled) {
          setItems([])
          setError(loadError instanceof Error ? loadError.message : "A busca falhou")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [catalogPreferences, query])

  const handleLoadMore = async () => {
    setLoading(true)
    try {
      const data = await fetchSearch(catalogPreferences, query, page + 1)
      setItems((current) => dedupeItems([...current, ...data.items]))
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "A busca falhou")
    } finally {
      setLoading(false)
    }
  }

  const ownItems = useMemo(() => {
    if (!hasOwnServices) return items
    return items.filter((item) => item.onOwnServices)
  }, [hasOwnServices, items])

  const otherItems = useMemo(() => {
    if (!hasOwnServices) return []
    return items.filter((item) => !item.onOwnServices)
  }, [hasOwnServices, items])

  if (!query) {
    return (
      <div className="mx-auto max-w-2xl">
        <SearchBox defaultValue="" />
        <p className="mt-8 text-sm text-mist">Digite um título para buscar no catálogo.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <SearchBox defaultValue={query} />
      {loading && items.length === 0 ? <CatalogSkeleton /> : null}
      {error ? <StatusPanel title="A busca falhou" message={error} /> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="text-sm text-mist">Nenhum título encontrado para essa busca.</p>
      ) : null}
      {items.length > 0 && !hasOwnServices ? (
        <section>
          <h2 className="mb-5 text-lg font-semibold">Resultados ({items.length})</h2>
          <CatalogGrid items={items} />
        </section>
      ) : null}
      {ownItems.length > 0 ? (
        <section>
          <h2 className="mb-5 text-lg font-semibold">
            Nos seus streamings ({ownItems.length})
          </h2>
          <CatalogGrid items={ownItems} />
        </section>
      ) : null}
      {hasOwnServices && items.length > 0 && otherItems.length === 0 ? (
        <p className="text-sm text-mist">Nada fora dos seus serviços para essa busca.</p>
      ) : null}
      {otherItems.length > 0 ? (
        <section>
          <h2 className="mb-5 text-lg font-semibold">
            Fora dos seus streamings ({otherItems.length})
          </h2>
          <CatalogGrid items={otherItems} showOffServiceHint />
        </section>
      ) : null}
      {page < totalPages ? (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loading}
          className="cta-ghost mx-auto flex h-12 w-fit items-center rounded-full px-6 text-sm font-semibold disabled:opacity-40"
        >
          {loading ? "Carregando…" : "Carregar mais"}
        </button>
      ) : null}
    </div>
  )
}

const SearchBox = ({ defaultValue }: { defaultValue: string }) => {
  return (
    <form action="/busca" className="focus-pill flex h-12 items-center rounded-full bg-white/6 px-4 ring-1 ring-white/8">
      <label htmlFor="busca-titulo" className="sr-only">
        Buscar filmes e séries por título
      </label>
      <input
        id="busca-titulo"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Buscar filmes e séries por título…"
        className="h-full w-full bg-transparent text-sm text-paper outline-none placeholder:text-mist"
      />
    </form>
  )
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <SearchResults />
    </Suspense>
  )
}
