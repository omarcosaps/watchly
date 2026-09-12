"use client"

import { useRouter, useSearchParams } from "next/navigation"

import type { MergedGenre, WatchProvider } from "@/lib/catalog/types"

type CatalogFiltersProps = {
  genres: MergedGenre[]
  providers: WatchProvider[]
  showProviderFilter?: boolean
}

export const CatalogFilters = ({
  genres,
  providers,
  showProviderFilter = false,
}: CatalogFiltersProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (name: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (!value) {
      next.delete(name)
    } else {
      next.set(name, value)
    }
    router.replace(`/?${next.toString()}`)
  }

  return (
    <form
      className="flex flex-wrap items-center gap-2"
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
      <label className="focus-pill press-pill flex h-11 items-center gap-2 rounded-full bg-white/6 px-4 text-sm text-mist ring-1 ring-white/8">
        <span>Ordenar por</span>
        <select
          id="filtro-ordem"
          value={searchParams.get("sort") ?? "popularity"}
          onChange={(event) => {
            handleChange("sort", event.target.value === "popularity" ? "" : event.target.value)
          }}
          className="max-w-40 bg-transparent text-sm text-paper outline-none"
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
      </label>
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
    <label htmlFor={id} className="focus-pill press-pill flex h-11 items-center gap-2 rounded-full bg-white/6 px-4 text-sm text-mist ring-1 ring-white/8">
      <span className="sr-only">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-44 bg-transparent text-sm text-paper outline-none"
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
