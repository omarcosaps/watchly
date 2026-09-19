"use client"

import { Suspense } from "react"
import { usePathname } from "next/navigation"

import { AppTopbar } from "@/components/app-topbar"
import { Attribution } from "@/components/attribution"
import { CatalogFilterSheet } from "@/components/catalog-filters"
import { HomeFilterChromeProvider } from "@/components/home-filter-chrome"
import { PageMotionFrame, PageMotionProvider } from "@/components/page-motion"
import { PendingWatchlistResume } from "@/components/pending-watchlist-resume"
import { cn } from "@/lib/cn"

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const isFlush = pathname === "/" || pathname.startsWith("/titulo/")
  const hasContentGap = pathname === "/watchlist" || pathname === "/busca"

  return (
    <Suspense>
      <HomeFilterChromeProvider>
        <PageMotionProvider>
          <div className="relative min-h-dvh bg-void">
            <a
              href="#conteudo"
              className="sr-only focus:not-sr-only focus:absolute focus:top-[max(1rem,var(--safe-top))] focus:left-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-void"
            >
              Ir para o conteúdo
            </a>
            <PendingWatchlistResume />
            <AppTopbar />
            <main
              id="conteudo"
              className={cn(
                isFlush ? "pt-chrome pb-chrome sm:pt-0 sm:pb-0" : "px-5 pb-chrome sm:px-12",
                !isFlush && (hasContentGap ? "pt-content" : "pt-chrome"),
              )}
            >
              <PageMotionFrame>{children}</PageMotionFrame>
            </main>
            <CatalogFilterSheet />
            <Attribution />
          </div>
        </PageMotionProvider>
      </HomeFilterChromeProvider>
    </Suspense>
  )
}
