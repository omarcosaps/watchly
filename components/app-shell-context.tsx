"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

type AppShellContextValue = {
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
  const [filtersOpen, setFiltersOpen] = useState(false)

  const value = useMemo(
    () => ({ filtersOpen, setFiltersOpen }),
    [filtersOpen],
  )

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
}
