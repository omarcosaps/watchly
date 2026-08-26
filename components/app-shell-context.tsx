"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

type AppShellContextValue = {
  navOpen: boolean
  setNavOpen: (open: boolean) => void
  filtersOpen: boolean
  setFiltersOpen: (open: boolean) => void
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

export const useAppShell = () => {
  const context = useContext(AppShellContext)
  if (!context) {
    throw new Error("useAppShell precisa do AppShell")
  }
  return context
}

export const AppShellProvider = ({ children }: { children: ReactNode }) => {
  const [navOpen, setNavOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const value = useMemo(
    () => ({ navOpen, setNavOpen, filtersOpen, setFiltersOpen }),
    [filtersOpen, navOpen],
  )

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
}
