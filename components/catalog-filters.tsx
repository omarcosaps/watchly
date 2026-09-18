"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useId, useRef } from "react"

import { CATALOG_FILTER_SHEET_ID, useHomeFilterChrome } from "@/components/home-filter-chrome"
import { CloseIcon } from "@/components/icons"
import { useScreenNavigate } from "@/hooks/use-screen-navigate"
import type { MergedGenre, WatchProvider } from "@/lib/catalog/types"
import { cn } from "@/lib/cn"

type FilterLayout = "strip" | "stack"

type CatalogFiltersProps = {
  genres: MergedGenre[]
  providers: WatchProvider[]
  showProviderFilter?: boolean
  resultCount?: number
  enter?: boolean
  layout?: FilterLayout
}

export const CatalogFilters = ({
  genres,
  providers,
  showProviderFilter = false,
  resultCount,
  enter = false,
  layout = "strip",
}: CatalogFiltersProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { leaveTo } = useScreenNavigate()
  const isStack = layout === "stack"
  const idSuffix = isStack ? "-sheet" : ""

  const handleChange = (name: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (!value) {
      next.delete(name)
    } else {
      next.set(name, value)
    }
    const href = next.toString() ? `/?${next.toString()}` : "/"
    if (name === "media") {
      leaveTo(href)
      return
    }
    router.replace(href)
  }

  return (
    <form
      className={cn(
        isStack ? "flex flex-col gap-3" : "mb-[22px] hidden flex-wrap items-center gap-2.5 sm:flex",
        enter && "d-in",
      )}
      style={enter ? { animationDelay: "0.34s" } : undefined}
      aria-label="Filtros do catálogo"
      onSubmit={(event) => event.preventDefault()}
    >
      <FilterSelect
        id={`filtro-tipo${idSuffix}`}
        label="Tipo"
        value={searchParams.get("media") ?? ""}
        onChange={(value) => handleChange("media", value)}
        fullWidth={isStack}
        options={[
          { value: "", label: "Filmes e séries" },
          { value: "movie", label: "Filmes" },
          { value: "tv", label: "Séries" },
        ]}
      />
      <FilterSelect
        id={`filtro-genero${idSuffix}`}
        label="Gênero"
        value={searchParams.get("genre") ?? ""}
        onChange={(value) => handleChange("genre", value)}
        fullWidth={isStack}
        options={[
          { value: "", label: "Todos os gêneros" },
          ...genres.map((genre) => ({ value: genre.name, label: genre.name })),
        ]}
      />
      {showProviderFilter ? (
        <FilterSelect
          id={`filtro-provedor${idSuffix}`}
          label="Provedor"
          value={searchParams.get("filterProviders") ?? ""}
          onChange={(value) => handleChange("filterProviders", value)}
          fullWidth={isStack}
          options={[
            { value: "", label: "Todos os serviços" },
            ...providers.map((provider) => ({
              value: String(provider.id),
              label: provider.name,
            })),
          ]}
        />
      ) : null}
      <FilterSelect
        id={`filtro-ano${idSuffix}`}
        label="Ano"
        value={searchParams.get("yearRange") ?? ""}
        onChange={(value) => handleChange("yearRange", value)}
        fullWidth={isStack}
        options={[
          { value: "", label: "Todos os anos" },
          { value: "2024-2025", label: "2024–2025" },
          { value: "2020-2023", label: "2020–2023" },
          { value: "2010-2019", label: "2010–2019" },
          { value: "before-2010", label: "Antes de 2010" },
        ]}
      />
      <div
        className={cn(
          "flex flex-wrap items-center gap-2.5",
          isStack ? "flex-col items-stretch" : "sm:ml-auto sm:flex-none",
        )}
      >
        <span className="whitespace-nowrap text-xs text-mute">Ordenar por</span>
        <label htmlFor={`filtro-ordem${idSuffix}`} className="sr-only">
          Ordenar por
        </label>
        <select
          id={`filtro-ordem${idSuffix}`}
          value={searchParams.get("sort") ?? "popularity"}
          onChange={(event) => {
            handleChange("sort", event.target.value === "popularity" ? "" : event.target.value)
          }}
          className={cn("filter-select", isStack && "w-full")}
        >
          <option value="popularity" className="bg-panel text-paper">
            Popularidade
          </option>
          <option value="vote" className="bg-panel text-paper">
            Nota
          </option>
          <option value="date" className="bg-panel text-paper">
            Data de lançamento
          </option>
        </select>
        {resultCount !== undefined ? (
          <span className="whitespace-nowrap text-[12.5px] text-mute">
            {resultCount} {resultCount === 1 ? "título" : "títulos"}
          </span>
        ) : null}
      </div>
    </form>
  )
}

export const CatalogFilterSheet = () => {
  const { open, closeFilters, slot } = useHomeFilterChrome()
  const labelId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFilters()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, closeFilters])

  if (!open || !slot) return null

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) closeFilters()
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end bg-void/80 backdrop-blur-md sm:hidden"
      onClick={handleBackdropClick}
    >
      <div
        id={CATALOG_FILTER_SHEET_ID}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className="relative flex max-h-[min(92dvh,calc(100dvh-var(--safe-top)))] w-full flex-col overflow-hidden rounded-t-[20px] bg-panel pb-[var(--safe-bottom)] ring-1 ring-white/10 shadow-[0_-24px_80px_rgb(0_0_0/0.65)]"
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <h2
            id={labelId}
            className="min-w-0 flex-1 text-xl font-extrabold tracking-[-0.02em] text-paper"
          >
            Filtros
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeFilters}
            aria-label="Fechar filtros"
            className="press-pill glass inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-paper"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-5">
          <CatalogFilters
            layout="stack"
            genres={slot.genres}
            providers={slot.providers}
            showProviderFilter={slot.showProviderFilter}
            resultCount={slot.resultCount}
          />
        </div>
      </div>
    </div>
  )
}

const FilterSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  fullWidth = false,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  fullWidth?: boolean
}) => {
  return (
    <label htmlFor={id} className={fullWidth ? "block w-full" : undefined}>
      <span className="sr-only">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn("filter-select", fullWidth && "w-full")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-panel text-paper">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
