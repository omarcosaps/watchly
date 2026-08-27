"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { CloseIcon } from "@/components/icons"
import type { MergedGenre, WatchProvider } from "@/lib/catalog/types"
import { MONETIZATION_LABEL } from "@/lib/catalog/types"
import { MONETIZATION_TYPES } from "@/lib/catalog/params"

type CatalogFiltersProps = {
  genres: MergedGenre[]
  providers: WatchProvider[]
  onClose?: () => void
}

export const CatalogFilters = ({ genres, providers, onClose }: CatalogFiltersProps) => {
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

  const handleClear = () => {
    router.replace("/")
  }

  const hasFilters = [...searchParams.keys()].some((key) => key !== "page")

  return (
    <form
      className="glass rounded-[24px] p-4"
      aria-label="Filtros do catálogo"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-paper">Filtros</p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-mist press-pill hover:bg-white/8 hover:text-paper"
            aria-label="Fechar filtros"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
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
            { value: "", label: "Todos" },
            ...genres.map((genre) => ({ value: genre.name, label: genre.name })),
          ]}
        />
        <FilterSelect
          id="filtro-provedor"
          label="Provedor"
          value={searchParams.get("filterProviders") ?? ""}
          onChange={(value) => handleChange("filterProviders", value)}
          options={[
            { value: "", label: "Os seus" },
            ...providers.map((provider) => ({
              value: String(provider.id),
              label: provider.name,
            })),
          ]}
        />
        <FilterSelect
          id="filtro-forma"
          label="Como assistir"
          value={searchParams.get("monetization") ?? ""}
          onChange={(value) => handleChange("monetization", value)}
          options={[
            { value: "", label: "Todas as formas" },
            ...MONETIZATION_TYPES.map((type) => ({
              value: type,
              label: MONETIZATION_LABEL[type],
            })),
          ]}
        />
        <label className="focus-pill press-pill flex h-11 items-center gap-2 rounded-full bg-white/6 px-4 text-sm text-mist ring-1 ring-white/8">
          <span className="sr-only">Ano</span>
          <input
            type="number"
            min={1900}
            max={2100}
            inputMode="numeric"
            value={searchParams.get("year") ?? ""}
            onChange={(event) => handleChange("year", event.target.value)}
            placeholder="Ano"
            aria-label="Ano"
            className="w-16 bg-transparent text-sm text-paper outline-none placeholder:text-mist"
          />
        </label>
        <FilterSelect
          id="filtro-ordem"
          label="Ordem"
          value={searchParams.get("sort") ?? "popularity"}
          onChange={(value) => handleChange("sort", value === "popularity" ? "" : value)}
          options={[
            { value: "popularity", label: "Popularidade" },
            { value: "vote", label: "Nota" },
            { value: "date", label: "Data" },
          ]}
        />
        {hasFilters ? (
          <button
            type="button"
            onClick={handleClear}
            className="h-11 rounded-full px-4 text-sm text-mist transition-colors duration-200 hover:text-paper"
          >
            Limpar filtros
          </button>
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
    <label htmlFor={id} className="focus-pill press-pill flex h-11 items-center gap-2 rounded-full bg-white/6 px-4 text-sm text-mist ring-1 ring-white/8">
      <span className="sr-only">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-40 bg-transparent text-sm text-paper outline-none"
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
