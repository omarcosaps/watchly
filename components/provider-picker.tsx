"use client"

import type { WatchProvider } from "@/lib/catalog/types"
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
    return <p className="text-[13.5px] text-mute">Nenhum streaming listado para este país.</p>
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {providers.map((provider) => {
        const isSelected = selected.has(provider.id)

        return (
          <li key={provider.id}>
            <button
              type="button"
              onClick={() => handleToggle(provider.id)}
              aria-pressed={isSelected}
              title={provider.name}
              className={cn(
                "relative flex w-full items-center justify-center rounded-full border px-3 py-4 text-[14px] font-semibold transition-colors duration-[150ms]",
                isSelected
                  ? "border-white/75 bg-transparent text-white hover:border-white"
                  : "border-white/14 bg-transparent text-white/60 hover:border-white/50 hover:bg-white/10 hover:text-white",
              )}
            >
              <span className="truncate">{provider.name}</span>
              <span
                className={cn(
                  "absolute top-2 right-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-paper text-[11px] font-extrabold text-void",
                  isSelected ? "opacity-100" : "opacity-0",
                )}
                aria-hidden
              >
                ✓
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
