"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { CatalogGrid, CatalogSkeleton } from "@/components/catalog-grid"
import { StatusPanel } from "@/components/status-panel"
import { fetchSearch } from "@/lib/api"
import { dedupeItems } from "@/lib/catalog/merge"
import type { CatalogItem } from "@/lib/catalog/types"

const SearchResults = () => {
  const searchParams = useSearchParams()
  const query = (searchParams.get("q") ?? "").trim()
  const { preferences } = useAccount()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!preferences || !query) {
        setItems([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await fetchSearch(preferences, query, 1)
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
  }, [preferences, query])

  const handleLoadMore = async () => {
    if (!preferences) return
    setLoading(true)
    try {
      const data = await fetchSearch(preferences, query, page + 1)
      setItems((current) => dedupeItems([...current, ...data.items]))
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "A busca falhou")
    } finally {
      setLoading(false)
    }
  }

  if (!query) {
    return (
      <StatusPanel
        title="Buscar um título"
        message="Digite o nome de um filme ou série. Resultados fora dos seus streamings continuam visíveis."
      />
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-sm text-mist">Busca</p>
        <h1 className="font-display mt-1 text-5xl italic tracking-tight text-paper">“{query}”</h1>
      </div>
      {loading && items.length === 0 ? <CatalogSkeleton /> : null}
      {error ? (
        <StatusPanel title="A busca falhou" message={error} />
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <StatusPanel
          title="Nenhum título com esse nome"
          message="Tente outro termo. A busca não se limita aos seus streamings."
        />
      ) : null}
      {items.length > 0 ? (
        <>
          <CatalogGrid items={items} distinguishOwn />
          {page < totalPages ? (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="glass mx-auto h-12 w-fit rounded-full px-6 text-sm text-paper disabled:opacity-40"
            >
              {loading ? "Carregando…" : "Carregar mais"}
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <SearchResults />
    </Suspense>
  )
}
