"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { useAccount } from "@/components/account-provider"
import { SearchIcon } from "@/components/icons"
import { Wordmark } from "@/components/wordmark"
import { loginHref } from "@/lib/account/pending-watchlist"
import { cn } from "@/lib/cn"

export const AppTopbar = () => {
  return (
    <Suspense fallback={<TopbarFrame />}>
      <TopbarContent />
    </Suspense>
  )
}

const TopbarContent = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { session, preferences } = useAccount()
  const media = searchParams.get("media")
  const homeActive = pathname === "/" && !media
  const moviesActive = pathname === "/" && media === "movie"
  const seriesActive = pathname === "/" && media === "tv"
  const watchlistActive = pathname === "/watchlist"
  const searchActive = pathname === "/busca"
  const prefsActive = pathname === "/preferencias"

  const handleWatchlist = () => {
    if (!session) {
      router.push(loginHref("watchlist"))
      return
    }
    if (!preferences) {
      router.push("/onboarding")
      return
    }
    router.push("/watchlist")
  }

  return (
    <TopbarFrame>
      <Wordmark href="/" />

      <nav className="flex items-center gap-0.5" aria-label="Principal">
        <NavLink href="/" active={homeActive}>
          Início
        </NavLink>
        <NavLink href="/?media=movie" active={moviesActive}>
          Filmes
        </NavLink>
        <NavLink href="/?media=tv" active={seriesActive}>
          Séries
        </NavLink>
        <button
          type="button"
          onClick={handleWatchlist}
          aria-current={watchlistActive ? "page" : undefined}
          className={navClass(watchlistActive)}
        >
          Watchlist
        </button>
      </nav>

      <Link
        href="/busca"
        aria-label="Buscar"
        title="Buscar"
        aria-current={searchActive ? "page" : undefined}
        className={cn(
          "inline-flex h-[30px] w-8 items-center justify-center rounded-full transition-colors duration-[150ms]",
          searchActive
            ? "cursor-default text-white"
            : "cursor-pointer text-white/60 hover:text-white",
        )}
      >
        <SearchIcon className="h-[15px] w-[15px]" />
      </Link>

      <span className="mx-1.5 h-[18px] w-px bg-white/14" aria-hidden />

      {session ? (
        <Link
          href="/preferencias"
          title="Sua conta e preferências"
          aria-current={prefsActive ? "page" : undefined}
          className={cn(
            "flex items-center gap-[9px] rounded-full py-[5px] pr-[14px] pl-[5px] text-[13px] font-semibold transition-colors duration-[150ms]",
            prefsActive
              ? "cursor-default bg-paper text-void"
              : "cursor-pointer bg-white/8 text-white hover:bg-white/16",
          )}
        >
          <span
            className={cn(
              "flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-extrabold",
              prefsActive ? "bg-void text-paper" : "bg-white/18 text-white",
            )}
          >
            {initialsFromEmail(session.email)}
          </span>
          <span className="max-w-28 truncate">{shortNameFromEmail(session.email)}</span>
        </Link>
      ) : (
        <>
          <Link
            href="/login"
            className="rounded-full px-[13px] py-2 text-[13.5px] font-semibold text-white/60 transition-colors duration-[150ms] hover:text-white"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="cta-primary rounded-full px-[17px] py-[9px] text-[13.5px] font-semibold"
          >
            Criar conta
          </Link>
        </>
      )}
    </TopbarFrame>
  )
}

const TopbarFrame = ({ children }: { children?: React.ReactNode }) => {
  return (
    <header className="fixed top-4 left-1/2 z-[60] w-max max-w-[calc(100vw-16px)] -translate-x-1/2">
      <div className="hide-scrollbar flex items-center gap-0.5 overflow-x-auto rounded-full border border-white/9 bg-[rgba(16,17,23,0.7)] px-2 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-[20px]">
        {children ?? <div className="h-8 w-48" />}
      </div>
    </header>
  )
}

const NavLink = ({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) => {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={navClass(active)}>
      {children}
    </Link>
  )
}

const navClass = (active: boolean) => {
  return cn(
    "shrink-0 whitespace-nowrap rounded-full px-[13px] py-2 text-[13.5px] transition-colors duration-[150ms]",
    active
      ? "cursor-default font-bold text-white"
      : "cursor-pointer font-medium text-white/60 hover:text-white",
  )
}

const shortNameFromEmail = (email: string) => {
  return email.split("@")[0] ?? "Você"
}

const initialsFromEmail = (email: string) => {
  return shortNameFromEmail(email).slice(0, 2).toUpperCase()
}
