"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAccount } from "@/components/account-provider"
import { consumePendingWatchlist } from "@/lib/account/pending-watchlist"
import { tipoFromMedia } from "@/lib/media"

let resumedForEmail: string | null = null

export const PendingWatchlistResume = () => {
  const router = useRouter()
  const { session, preferences, addToWatchlist, isSaved } = useAccount()

  useEffect(() => {
    if (!session) {
      resumedForEmail = null
      return
    }

    if (!preferences || resumedForEmail === session.email) return

    const pending = consumePendingWatchlist()
    if (!pending) return

    resumedForEmail = session.email

    const resume = async () => {
      if (!isSaved(pending.mediaType, pending.tmdbId)) {
        await addToWatchlist(pending)
      }

      router.replace(`/titulo/${tipoFromMedia(pending.mediaType)}/${pending.tmdbId}`)
    }

    void resume()
  }, [addToWatchlist, isSaved, preferences, router, session])

  return null
}
