"use client"

import { useAccount } from "@/components/account-provider"
import { CheckIcon } from "@/components/icons"
import { cn } from "@/lib/cn"
import { resolveWatchStatus } from "@/lib/account/watch-status"
import type { MediaType } from "@/lib/media"

type WatchStatusToggleProps = {
  mediaType: MediaType
  tmdbId: number
  variant?: "stamp" | "pill"
}

export const WatchStatusToggle = ({
  mediaType,
  tmdbId,
  variant = "stamp",
}: WatchStatusToggleProps) => {
  const { watchlist, setWatchlistWatched } = useAccount()
  const saved = watchlist.find((item) => {
    return item.mediaType === mediaType && item.tmdbId === tmdbId
  })
  const status = resolveWatchStatus(saved)

  if (!status) return null

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setWatchlistWatched(mediaType, tmdbId, !status.watched)
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={status.watched}
        aria-label={status.label}
        className={cn(
          "cta-ghost press-pill inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold focus-visible:outline-offset-2",
          status.watched ? "text-paper" : "text-mist",
        )}
      >
        {status.watched ? <CheckIcon className="h-4 w-4 shrink-0 text-gold" /> : null}
        {status.label}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={status.watched}
      aria-label={status.label}
      className={cn(
        "press-pill inline-flex max-w-full items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium backdrop-blur-md focus-visible:outline-offset-2",
        status.watched ? "text-paper" : "text-mist",
      )}
    >
      {status.watched ? <CheckIcon className="h-3 w-3 shrink-0 text-gold" /> : null}
      <span className="truncate">{status.label}</span>
    </button>
  )
}
