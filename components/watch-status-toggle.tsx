"use client"

import { useAccount } from "@/components/account-provider"
import { cn } from "@/lib/cn"
import { resolveWatchStatus, watchStatusLabel } from "@/lib/account/watch-status"
import type { MediaType } from "@/lib/media"

type WatchStatusToggleProps = {
  mediaType: MediaType
  tmdbId: number
  variant?: "detail" | "compact"
}

export const WatchStatusToggle = ({
  mediaType,
  tmdbId,
  variant = "detail",
}: WatchStatusToggleProps) => {
  const { watchlist, setWatchlistWatched } = useAccount()
  const saved = watchlist.find((item) => {
    return item.mediaType === mediaType && item.tmdbId === tmdbId
  })
  const status = resolveWatchStatus(saved)

  if (!status) return null

  const compact = variant === "compact"

  return (
    <div className={compact ? undefined : "mb-[26px]"}>
      {compact ? null : (
        <p className="mb-2.5 text-[11px] font-bold tracking-[0.09em] text-mute uppercase">
          Meu status
        </p>
      )}
      <div
        className="inline-flex items-center gap-0.5 rounded-full bg-white/5 p-[3px]"
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
              onClick={() => {
                void setWatchlistWatched(mediaType, tmdbId, watched)
              }}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full whitespace-nowrap transition-colors duration-[180ms]",
                compact ? "px-3 py-1.5 text-xs" : "px-[15px] py-2 text-[13px]",
                active
                  ? "cursor-default bg-white/13 font-semibold text-white"
                  : "cursor-pointer font-medium text-white/50 hover:text-white/80",
              )}
            >
              <svg
                width={compact ? 11 : 12}
                height={compact ? 11 : 12}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className={cn(
                  "block transition-opacity duration-[180ms]",
                  active ? "opacity-100" : "opacity-0",
                )}
              >
                <path d="M5 13l4.5 4.5L19 7" />
              </svg>
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
