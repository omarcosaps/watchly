"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"

import type { MergedGenre, WatchProvider } from "@/lib/catalog/types"

export const CATALOG_FILTER_SHEET_ID = "catalog-filters-sheet"

export type HomeFilterSlot = {
  genres: MergedGenre[]
  providers: WatchProvider[]
  showProviderFilter: boolean
  resultCount?: number
}

type HomeFilterChromeValue = {
  open: boolean
  slot: HomeFilterSlot | null
  openFilters: () => void
  closeFilters: () => void
  toggleFilters: () => void
  setSlot: (slot: HomeFilterSlot | null) => void
}

const HomeFilterChromeContext = createContext<HomeFilterChromeValue | null>(null)

export const HomeFilterChromeProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [wide, setWide] = useState(false)
  const [slot, setSlotState] = useState<HomeFilterSlot | null>(null)

  if (pathname !== "/" && open) {
    setOpen(false)
  }

  if (pathname !== "/" && slot) {
    setSlotState(null)
  }

  if (wide && open) {
    setOpen(false)
  }

  const closeFilters = useCallback(() => {
    setOpen(false)
  }, [])

  const openFilters = useCallback(() => {
    setOpen(true)
  }, [])

  const toggleFilters = useCallback(() => {
    setOpen((current) => !current)
  }, [])

  const setSlot = useCallback((next: HomeFilterSlot | null) => {
    if (next === null) return
    setSlotState(next)
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)")
    const syncWide = () => setWide(media.matches)
    syncWide()
    media.addEventListener("change", syncWide)
    window.addEventListener("resize", syncWide)
    return () => {
      media.removeEventListener("change", syncWide)
      window.removeEventListener("resize", syncWide)
    }
  }, [])

  const value = useMemo(
    () => ({
      open,
      slot,
      openFilters,
      closeFilters,
      toggleFilters,
      setSlot,
    }),
    [open, slot, openFilters, closeFilters, toggleFilters, setSlot],
  )

  return <HomeFilterChromeContext value={value}>{children}</HomeFilterChromeContext>
}

export const useHomeFilterChrome = () => {
  const context = useContext(HomeFilterChromeContext)
  if (!context) {
    throw new Error("useHomeFilterChrome precisa do HomeFilterChromeProvider")
  }
  return context
}
