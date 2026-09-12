import type { WatchlistItem } from "@/lib/account/types"

export const watchStatusLabel = (watched: boolean) => {
  return watched ? "Já assistido" : "Ainda não assistido"
}

export const resolveWatchStatus = (item: WatchlistItem | undefined) => {
  if (!item) return null

  return {
    watched: item.watched,
    label: watchStatusLabel(item.watched),
  }
}
