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

  return (
    <div className="mx-auto max-w-[1280px]">
      <SearchBox defaultValue={query} />
      {!query ? (
        <p className="py-20 text-center text-[14.5px] text-white/40">
          Digite um título para buscar no catálogo.
        </p>
      ) : null}
      {query && loading && items.length === 0 ? <div className="mt-[34px]"><CatalogSkeleton /></div> : null}
      {error ? <StatusPanel title="A busca falhou" message={error} /> : null}
      {query && !loading && !error && items.length === 0 ? (
        <p className="mt-[34px] text-[13.5px] text-mute">Nenhum título encontrado para essa busca.</p>
      ) : null}
      {items.length > 0 && !hasOwnServices ? (
        <section className="mt-[34px]">
          <h2 className="mb-4 text-xl font-extrabold tracking-[-0.02em]">
            Resultados{" "}
            <span className="text-sm font-semibold text-white/40">{items.length}</span>
          </h2>
          <CatalogGrid items={items} />
        </section>
      ) : null}
      {items.length > 0 && hasOwnServices ? (
        <>
          <section className="mt-[34px]">
            <h2 className="mb-4 text-xl font-extrabold tracking-[-0.02em]">
              Nos seus streamings{" "}
              <span className="text-sm font-semibold text-white/40">{ownItems.length}</span>
            </h2>
            {ownItems.length === 0 ? (
              <p className="text-[13.5px] text-mute">Nenhum título encontrado para essa busca.</p>
            ) : (
              <CatalogGrid items={ownItems} />
            )}
          </section>
          <section className="mt-[38px]">
            <h2 className="mb-4 text-xl font-extrabold tracking-[-0.02em]">
              Fora dos seus streamings{" "}
              <span className="text-sm font-semibold text-white/40">{otherItems.length}</span>
            </h2>
            {otherItems.length === 0 ? (
              <p className="text-[13.5px] text-mute">Nada fora dos seus serviços para essa busca.</p>
            ) : (
              <CatalogGrid items={otherItems} showOffServiceHint muted />
            )}
          </section>
        </>
      ) : null}
      {page < totalPages ? (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loading}
          className="cta-secondary mx-auto mt-10 flex w-fit items-center rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-40"
        >
          {loading ? "Carregando…" : "Carregar mais"}
        </button>
      ) : null}
    </div>
  )
}

const SearchBox = ({ defaultValue }: { defaultValue: string }) => {
  return (
    <form action="/busca">
      <label htmlFor="busca-titulo" className="sr-only">
        Buscar filmes e séries por título
      </label>
      <input
        id="busca-titulo"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Buscar filmes e séries por título…"
        autoFocus
        className="field-search"
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
