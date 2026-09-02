import type { WatchlistItem } from "@/lib/account/types"

export const watchStatusLabel = (watched: boolean) => {
  return watched ? "Já assistir" : "Ainda não assistir"
}

export const resolveWatchStatus = (item: WatchlistItem | undefined) => {
  if (!item) return null

  return {
    watched: item.watched,
    label: watchStatusLabel(item.watched),
  }
}
