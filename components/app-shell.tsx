"use client"

import { useEffect } from "react"

import { AppSidebar } from "@/components/app-sidebar"
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
  const { navOpen, setNavOpen, setFiltersOpen } = useAppShell()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setNavOpen(false)
      setFiltersOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setFiltersOpen, setNavOpen])

  return (
    <div className="min-h-dvh bg-void md:p-3 lg:p-4">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-paper focus:px-4 focus:py-2 focus:text-void"
      >
        Ir para o conteúdo
      </a>
      <div className="relative flex h-dvh overflow-hidden bg-stage md:h-[calc(100dvh-1.5rem)] md:rounded-[32px] md:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_40px_80px_rgba(0,0,0,0.55)] lg:h-[calc(100dvh-2rem)]">
        {navOpen ? (
          <button
            type="button"
            className="absolute inset-0 z-30 bg-black/55 lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setNavOpen(false)}
          />
        ) : null}
        <AppSidebar />
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
    </div>
  )
}
