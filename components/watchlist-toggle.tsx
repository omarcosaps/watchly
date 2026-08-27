"use client"

import { useState } from "react"

import { useAccount } from "@/components/account-provider"
import { BookmarkIcon, CheckIcon, PlusIcon } from "@/components/icons"
import { cn } from "@/lib/cn"
import type { MediaType } from "@/lib/media"

type WatchlistToggleProps = {
  tmdbId: number
  mediaType: MediaType
  title: string
  posterPath: string | null
  year: number | null
  className?: string
  variant?: "icon" | "pill" | "plus"
}

export const WatchlistToggle = ({
  tmdbId,
  mediaType,
  title,
  posterPath,
  year,
  className,
  variant = "icon",
}: WatchlistToggleProps) => {
  const account = useAccount()
  const [stampTick, setStampTick] = useState(0)
  const saved = account.watchlist.some((item) => {
    return item.mediaType === mediaType && item.tmdbId === tmdbId
  })

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    try {
      if (saved) {
        account.removeFromWatchlist(mediaType, tmdbId)
      } else {
        account.addToWatchlist({
          tmdbId,
          mediaType,
          title,
          posterPath,
          year,
        })
      }
      setStampTick((tick) => tick + 1)
    } catch {
      return
    }
  }

  const stampClass = stampTick > 0 ? "stamp-icon inline-flex" : "inline-flex"

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? "Remover da watchlist" : "Guardar na watchlist"}
        className={cn(
          "press-pill inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium text-paper",
          saved ? "glass-strong" : "glass",
          className,
        )}
      >
        <span key={stampTick} className={stampClass}>
          {saved ? <CheckIcon /> : <PlusIcon />}
        </span>
        {saved ? "Na watchlist" : "Watchlist"}
      </button>
    )
  }

  if (variant === "plus") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? "Remover da watchlist" : "Guardar na watchlist"}
        className={cn(
          "press-pill inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/14 text-paper backdrop-blur-md hover:bg-white/22",
          className,
        )}
      >
        <span key={stampTick} className={stampClass}>
          {saved ? <CheckIcon /> : <PlusIcon />}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? "Remover da watchlist" : "Guardar na watchlist"}
      className={cn(
        "press-pill inline-flex h-9 w-9 items-center justify-center rounded-full text-paper",
        saved ? "glass-strong" : "glass",
        className,
      )}
    >
      <span key={stampTick} className={stampClass}>
        <BookmarkIcon className="h-4 w-4" />
      </span>
    </button>
  )
}
