"use client"

import { usePathname } from "next/navigation"

import { AppTopbar } from "@/components/app-topbar"
import { Attribution } from "@/components/attribution"
import { PendingWatchlistResume } from "@/components/pending-watchlist-resume"
import { cn } from "@/lib/cn"

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const isFlush = pathname === "/" || pathname.startsWith("/titulo/")

  return (
    <div className="relative min-h-dvh bg-void">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-void"
      >
        Ir para o conteúdo
      </a>
      <PendingWatchlistResume />
      <AppTopbar />
      <main
        id="conteudo"
        className={cn(isFlush ? "" : "px-5 pt-[110px] pb-[70px] sm:px-12")}
      >
        {children}
      </main>
      <Attribution />
    </div>
  )
}
