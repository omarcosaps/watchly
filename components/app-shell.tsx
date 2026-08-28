"use client"

import { useEffect } from "react"

import { AppShellProvider, useAppShell } from "@/components/app-shell-context"
import { AppTopbar } from "@/components/app-topbar"
import { Attribution } from "@/components/attribution"

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppShellProvider>
      <AppShellFrame>{children}</AppShellFrame>
    </AppShellProvider>
  )
}

const AppShellFrame = ({ children }: { children: React.ReactNode }) => {
  const { setFiltersOpen } = useAppShell()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setFiltersOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setFiltersOpen])

  return (
    <div className="relative flex h-dvh overflow-hidden bg-void">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-paper focus:px-4 focus:py-2 focus:text-void"
      >
        Ir para o conteúdo
      </a>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />
        <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto">
          <main id="conteudo" className="px-4 pb-10 pt-3 sm:px-6 lg:px-7">
            {children}
          </main>
          <Attribution />
        </div>
      </div>
    </div>
  )
}
