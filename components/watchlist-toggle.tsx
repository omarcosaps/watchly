"use client"

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
  const saved = account.watchlist.some((item) => {
    return item.mediaType === mediaType && item.tmdbId === tmdbId
  })

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    try {
      if (saved) {
        account.removeFromWatchlist(mediaType, tmdbId)
        return
      }

      account.addToWatchlist({
        tmdbId,
        mediaType,
        title,
        posterPath,
        year,
      })
    } catch {
      return
    }
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? "Remover da watchlist" : "Guardar na watchlist"}
        className={cn(
          "inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium text-paper transition-colors duration-200",
          saved ? "glass-strong" : "glass",
          className,
        )}
      >
        {saved ? <CheckIcon /> : <PlusIcon />}
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
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/14 text-paper backdrop-blur-md transition-colors duration-200 hover:bg-white/22",
          className,
        )}
      >
        {saved ? <CheckIcon /> : <PlusIcon />}
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
        "inline-flex h-9 w-9 items-center justify-center rounded-full text-paper transition-colors duration-200",
        saved ? "glass-strong" : "glass",
        className,
      )}
    >
      <BookmarkIcon className="h-4 w-4" />
    </button>
  )
}
