"use client"

import { useAccount } from "@/components/account-provider"
import { CheckIcon } from "@/components/icons"
import { cn } from "@/lib/cn"
import { resolveWatchStatus, watchStatusLabel } from "@/lib/account/watch-status"
import type { MediaType } from "@/lib/media"

type WatchStatusToggleProps = {
  mediaType: MediaType
  tmdbId: number
  variant?: "stamp" | "pill" | "segmented"
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

  const handleSet = (watched: boolean) => {
    setWatchlistWatched(mediaType, tmdbId, watched)
  }

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    handleSet(!status.watched)
  }

  if (variant === "segmented") {
    return (
      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-paper">Meu status</h2>
        <div
          className="inline-flex rounded-full bg-white/5 p-1"
          role="group"
          aria-label="Status de visualização"
        >
          {[false, true].map((watched) => {
            const active = status.watched === watched
            const label = watchStatusLabel(watched)
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleSet(watched)}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium",
                  active ? "bg-white/13 text-paper" : "cursor-pointer text-white/50 hover:text-white/80",
                )}
              >
                {active ? <CheckIcon className="h-3.5 w-3.5" /> : null}
                {label}
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleToggle}
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
      onClick={handleToggle}
      aria-pressed={status.watched}
      aria-label={status.label}
      className={cn(
        "press-pill inline-flex max-w-full items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[12px] font-medium backdrop-blur-md focus-visible:outline-offset-2",
        status.watched ? "text-paper" : "text-mist",
      )}
    >
      {status.watched ? <CheckIcon className="h-3 w-3 shrink-0 text-gold" /> : null}
      <span className="truncate">{status.label}</span>
    </button>
  )
}
