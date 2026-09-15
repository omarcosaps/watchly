"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, type ReactNode } from "react"

import { useAccount } from "@/components/account-provider"
import { SearchIcon } from "@/components/icons"
import { ScreenLink } from "@/components/screen-link"
import { Wordmark } from "@/components/wordmark"
import { useScreenNavigate } from "@/hooks/use-screen-navigate"
import { loginHref } from "@/lib/account/pending-watchlist"
import type { Session } from "@/lib/account/types"
import { cn } from "@/lib/cn"

type NavVariant = "compact" | "pill"

type NavState = {
  homeActive: boolean
  moviesActive: boolean
  seriesActive: boolean
  watchlistActive: boolean
  handleWatchlist: () => void
}

export const AppTopbar = () => {
  return (
    <Suspense fallback={<TopbarFallback />}>
      <TopbarContent />
    </Suspense>
  )
}

const TopbarContent = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { session, preferences } = useAccount()
  const { leaveTo } = useScreenNavigate()
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
    if (watchlistActive) return
    leaveTo("/watchlist")
  }

  const navState: NavState = {
    homeActive,
    moviesActive,
    seriesActive,
    watchlistActive,
    handleWatchlist,
  }

  return (
    <>
      <CompactChrome>
        <div className="flex h-12 items-center justify-between gap-1 px-2">
          <Wordmark href="/" />
          <div className="flex min-w-0 items-center gap-0.5">
            <SearchControl active={searchActive} />
            <AccountControls layout="compact" prefsActive={prefsActive} session={session} />
          </div>
        </div>
        <PrincipalNav variant="compact" {...navState} />
      </CompactChrome>

      <PillChrome>
        <Wordmark href="/" />
        <PrincipalNav variant="pill" {...navState} />
        <SearchControl active={searchActive} />
        <span className="mx-1.5 h-[18px] w-px bg-white/14" aria-hidden />
        <AccountControls layout="pill" prefsActive={prefsActive} session={session} />
      </PillChrome>
    </>
  )
}

const TopbarFallback = () => {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[60] sm:hidden">
        <div className="h-[var(--chrome-top)] border-b border-white/9 bg-[rgba(16,17,23,0.7)] shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-[20px]" />
      </header>
      <header className="fixed top-4 left-1/2 z-[60] hidden w-max max-w-[calc(100vw-16px)] -translate-x-1/2 sm:block">
        <div className="flex items-center rounded-full border border-white/9 bg-[rgba(16,17,23,0.7)] px-2 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-[20px]">
          <div className="h-8 w-48" />
        </div>
      </header>
    </>
  )
}

const CompactChrome = ({ children }: { children: ReactNode }) => {
  return (
    <header className="fixed inset-x-0 top-0 z-[60] sm:hidden">
      <div className="border-b border-white/9 bg-[rgba(16,17,23,0.7)] pt-[var(--safe-top)] shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-[20px]">
        {children}
      </div>
    </header>
  )
}

const PillChrome = ({ children }: { children: ReactNode }) => {
  return (
    <header className="fixed top-4 left-1/2 z-[60] hidden w-max max-w-[calc(100vw-16px)] -translate-x-1/2 sm:block">
      <div className="hide-scrollbar flex items-center gap-0.5 overflow-x-auto rounded-full border border-white/9 bg-[rgba(16,17,23,0.7)] px-2 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-[20px]">
        {children}
      </div>
    </header>
  )
}

const PrincipalNav = ({
  variant,
  homeActive,
  moviesActive,
  seriesActive,
  watchlistActive,
  handleWatchlist,
}: { variant: NavVariant } & NavState) => {
  return (
    <nav
      aria-label="Principal"
      className={variant === "compact" ? "grid grid-cols-4" : "flex items-center gap-0.5"}
    >
      <NavLink href="/" active={homeActive} variant={variant}>
        Início
      </NavLink>
      <NavLink href="/?media=movie" active={moviesActive} variant={variant}>
        Filmes
      </NavLink>
      <NavLink href="/?media=tv" active={seriesActive} variant={variant}>
        Séries
      </NavLink>
      <button
        type="button"
        onClick={handleWatchlist}
        aria-current={watchlistActive ? "page" : undefined}
        className={navClass(watchlistActive, variant)}
      >
        Watchlist
      </button>
    </nav>
  )
}

const SearchControl = ({ active }: { active: boolean }) => {
  return (
    <ScreenLink
      href="/busca"
      aria-label="Buscar"
      title="Buscar"
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-[30px] w-8 items-center justify-center rounded-full transition-colors duration-[150ms]",
        active ? "cursor-default text-white" : "cursor-pointer text-white/60 hover:text-white",
      )}
    >
      <SearchIcon className="h-[15px] w-[15px]" />
    </ScreenLink>
  )
}

const AccountControls = ({
  layout,
  session,
  prefsActive,
}: {
  layout: NavVariant
  session: Session | null
  prefsActive: boolean
}) => {
  if (session) {
    return (
      <ScreenLink
        href="/preferencias"
        title="Sua conta e preferências"
        aria-current={prefsActive ? "page" : undefined}
        className={cn(
          "flex items-center rounded-full text-[13px] font-semibold transition-colors duration-[150ms]",
          prefsActive
            ? "cursor-default bg-paper text-void"
            : "cursor-pointer bg-white/8 text-white hover:bg-white/16",
          layout === "compact"
            ? "p-[5px]"
            : "gap-[9px] p-[5px] lg:py-[5px] lg:pr-[14px] lg:pl-[5px]",
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
        {layout === "pill" ? (
          <span className="hidden max-w-28 truncate lg:inline">{shortNameFromEmail(session.email)}</span>
        ) : null}
      </ScreenLink>
    )
  }

  return (
    <>
      <Link
        href="/login"
        className={cn(
          "shrink-0 whitespace-nowrap rounded-full font-semibold text-white/60 transition-colors duration-[150ms] hover:text-white",
          layout === "compact" ? "px-2.5 py-2 text-[13px]" : "px-[13px] py-2 text-[13.5px]",
        )}
      >
        Entrar
      </Link>
      <Link
        href="/cadastro"
        className={cn(
          "cta-primary shrink-0 whitespace-nowrap rounded-full font-semibold",
          layout === "compact" ? "px-3 py-2 text-[13px]" : "px-[17px] py-[9px] text-[13.5px]",
        )}
      >
        Criar conta
      </Link>
    </>
  )
}

const NavLink = ({
  href,
  active,
  variant,
  children,
}: {
  href: string
  active: boolean
  variant: NavVariant
  children: ReactNode
}) => {
  return (
    <ScreenLink href={href} aria-current={active ? "page" : undefined} className={navClass(active, variant)}>
      {children}
    </ScreenLink>
  )
}

const navClass = (active: boolean, variant: NavVariant) => {
  if (variant === "compact") {
    return cn(
      "flex h-11 items-center justify-center whitespace-nowrap px-1 text-[13px] transition-colors duration-[150ms]",
      active
        ? "cursor-default font-bold text-white"
        : "cursor-pointer font-medium text-white/60 hover:text-white",
    )
  }

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
