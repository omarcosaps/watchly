"use client"

import Image from "next/image"

import type { WatchProvider } from "@/lib/catalog/types"
import { logoUrl } from "@/lib/tmdb/image"
import { cn } from "@/lib/cn"

type ProviderPickerProps = {
  providers: WatchProvider[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
}

export const ProviderPicker = ({
  providers,
  selectedIds,
  onChange,
}: ProviderPickerProps) => {
  const selected = new Set(selectedIds)

  const handleToggle = (id: number) => {
    if (selected.has(id)) {
      onChange(selectedIds.filter((value) => value !== id))
      return
    }
    onChange([...selectedIds, id])
  }

  if (providers.length === 0) {
    return <p className="text-mist">Nenhum streaming listado para este país.</p>
  }

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {providers.map((provider) => {
        const isSelected = selected.has(provider.id)
        const src = logoUrl(provider.logoPath)

        return (
          <li key={provider.id}>
            <button
              type="button"
              onClick={() => handleToggle(provider.id)}
              aria-pressed={isSelected}
              className={cn(
                "flex h-full w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors duration-200",
                isSelected ? "bg-ember/15 text-paper ring-1 ring-ember/40" : "bg-white/4 text-mist ring-1 ring-white/6",
              )}
            >
              {src ? (
                <Image
                  src={src}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg bg-paper"
                />
              ) : (
                <span className="h-8 w-8 rounded-lg bg-graphite" aria-hidden />
              )}
              <span className="text-sm">{provider.name}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
