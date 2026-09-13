"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { useScreenNavigate } from "@/hooks/use-screen-navigate"
import { cn } from "@/lib/cn"
import type { MergedGenre, WatchProvider } from "@/lib/catalog/types"

type CatalogFiltersProps = {
  genres: MergedGenre[]
  providers: WatchProvider[]
  showProviderFilter?: boolean
  resultCount?: number
  enter?: boolean
}

export const CatalogFilters = ({
  genres,
  providers,
  showProviderFilter = false,
  resultCount,
  enter = false,
}: CatalogFiltersProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { leaveTo } = useScreenNavigate()

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
      className={cn("mb-[22px] flex flex-wrap items-center gap-2.5", enter && "d-in")}
      style={enter ? { animationDelay: "0.34s" } : undefined}
      aria-label="Filtros do catálogo"
      onSubmit={(event) => event.preventDefault()}
    >
      <FilterSelect
        id="filtro-tipo"
        label="Tipo"
        value={searchParams.get("media") ?? ""}
        onChange={(value) => handleChange("media", value)}
        options={[
          { value: "", label: "Filmes e séries" },
          { value: "movie", label: "Filmes" },
          { value: "tv", label: "Séries" },
        ]}
      />
      <FilterSelect
        id="filtro-genero"
        label="Gênero"
        value={searchParams.get("genre") ?? ""}
        onChange={(value) => handleChange("genre", value)}
        options={[
          { value: "", label: "Todos os gêneros" },
          ...genres.map((genre) => ({ value: genre.name, label: genre.name })),
        ]}
      />
      {showProviderFilter ? (
        <FilterSelect
          id="filtro-provedor"
          label="Provedor"
          value={searchParams.get("filterProviders") ?? ""}
          onChange={(value) => handleChange("filterProviders", value)}
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
        id="filtro-ano"
        label="Ano"
        value={searchParams.get("yearRange") ?? ""}
        onChange={(value) => handleChange("yearRange", value)}
        options={[
          { value: "", label: "Todos os anos" },
          { value: "2024-2025", label: "2024–2025" },
          { value: "2020-2023", label: "2020–2023" },
          { value: "2010-2019", label: "2010–2019" },
          { value: "before-2010", label: "Antes de 2010" },
        ]}
      />
      <div className="ml-auto flex flex-none items-center gap-2.5">
        <span className="whitespace-nowrap text-xs text-mute">Ordenar por</span>
        <label htmlFor="filtro-ordem" className="sr-only">
          Ordenar por
        </label>
        <select
          id="filtro-ordem"
          value={searchParams.get("sort") ?? "popularity"}
          onChange={(event) => {
            handleChange("sort", event.target.value === "popularity" ? "" : event.target.value)
          }}
          className="filter-select"
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
          <span className="ml-1.5 whitespace-nowrap text-[12.5px] text-mute">
            {resultCount} {resultCount === 1 ? "título" : "títulos"}
          </span>
        ) : null}
      </div>
    </form>
  )
}

const FilterSelect = ({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) => {
  return (
    <label htmlFor={id}>
      <span className="sr-only">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="filter-select"
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
