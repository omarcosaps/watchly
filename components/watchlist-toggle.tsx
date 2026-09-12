"use client"

import { useRouter } from "next/navigation"

import { useAccount } from "@/components/account-provider"
import { useToast } from "@/components/toast-provider"
import { loginHref, setPendingWatchlist } from "@/lib/account/pending-watchlist"
import { cn } from "@/lib/cn"
import type { MediaType } from "@/lib/media"

type WatchlistToggleProps = {
  tmdbId: number
  mediaType: MediaType
  title: string
  posterPath: string | null
  year: number | null
  className?: string
  variant?: "pill" | "primary"
}

export const WatchlistToggle = ({
  tmdbId,
  mediaType,
  title,
  posterPath,
  year,
  className,
  variant = "pill",
}: WatchlistToggleProps) => {
  const router = useRouter()
  const account = useAccount()
  const { showToast } = useToast()
  const saved = account.watchlist.some((item) => {
    return item.mediaType === mediaType && item.tmdbId === tmdbId
  })

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!account.session) {
      setPendingWatchlist({ tmdbId, mediaType, title, posterPath, year })
      router.push(loginHref("save"))
      return
    }

    try {
      if (saved) {
        account.removeFromWatchlist(mediaType, tmdbId)
        showToast(`Removido da minha lista: ${title}`)
      } else {
        account.addToWatchlist({
          tmdbId,
          mediaType,
          title,
          posterPath,
          year,
        })
        showToast(`Adicionado a minha lista: ${title}`)
      }
    } catch {
      return
    }
  }

  const label = saved
    ? variant === "primary"
      ? "✓ Na minha lista"
      : "Na minha lista"
    : variant === "primary"
      ? "+ Add a minha lista"
      : "Adicionar à minha lista"

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? "Remover da minha lista" : "Adicionar à minha lista"}
      className={cn(
        "inline-flex items-center rounded-full font-semibold",
        variant === "primary"
          ? "cta-primary px-[22px] py-3 text-sm font-bold"
          : "cta-ghost px-6 py-3.5 text-[15px] font-semibold",
        className,
      )}
    >
      {label}
    </button>
  )
}
