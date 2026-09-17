"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, type ComponentType, type ReactNode } from "react"

import { useAccount } from "@/components/account-provider"
import {
  BookmarkIcon,
  FilmIcon,
  HomeIcon,
  SearchIcon,
  TvIcon,
} from "@/components/icons"
import { ScreenLink } from "@/components/screen-link"
import { Wordmark } from "@/components/wordmark"
import { useScreenNavigate } from "@/hooks/use-screen-navigate"
import { loginHref } from "@/lib/account/pending-watchlist"
import type { Session } from "@/lib/account/types"
import { cn } from "@/lib/cn"

type AccountLayout = "compact" | "pill"

type NavState = {
  homeActive: boolean
  moviesActive: boolean
  seriesActive: boolean
  searchActive: boolean
  watchlistActive: boolean
  handleWatchlist: () => void
}

type TabIcon = ComponentType<{ className?: string }>

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
    searchActive,
    watchlistActive,
    handleWatchlist,
  }

  return (
    <>
      <CompactChrome>
        <div className="flex h-12 items-center justify-between gap-1 px-2">
          <Wordmark href="/" />
          <div className="flex min-w-0 items-center gap-0.5">
            <AccountControls layout="compact" prefsActive={prefsActive} session={session} />
          </div>
        </div>
      </CompactChrome>
      <CompactTabBar {...navState} />

      <PillChrome>
        <Wordmark href="/" />
        <PrincipalNav {...navState} />
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
      <div
        className="fixed inset-x-0 bottom-0 z-[60] h-[var(--chrome-bottom)] rounded-t-[20px] border border-b-0 border-white/9 bg-[rgba(16,17,23,0.7)] shadow-[0_-10px_40px_rgba(0,0,0,0.45)] backdrop-blur-[20px] sm:hidden"
        aria-hidden
      />
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

const CompactTabBar = ({
  homeActive,
  moviesActive,
  seriesActive,
  searchActive,
  watchlistActive,
  handleWatchlist,
}: NavState) => {
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-[60] sm:hidden">
      <div className="rounded-t-[20px] border border-b-0 border-white/9 bg-[rgba(16,17,23,0.7)] pb-[var(--safe-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.45)] backdrop-blur-[20px]">
        <div className="grid h-14 grid-cols-5">
          <TabLink href="/" active={homeActive} icon={HomeIcon} label="Início" />
          <TabLink href="/?media=movie" active={moviesActive} icon={FilmIcon} label="Filmes" />
          <TabLink href="/?media=tv" active={seriesActive} icon={TvIcon} label="Séries" />
          <TabLink href="/busca" active={searchActive} icon={SearchIcon} label="Busca" />
          <button
            type="button"
            onClick={handleWatchlist}
            aria-current={watchlistActive ? "page" : undefined}
            className={tabClass(watchlistActive)}
          >
            <BookmarkIcon className="h-[18px] w-[18px]" />
            Lista
          </button>
        </div>
      </div>
    </nav>
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
  homeActive,
  moviesActive,
  seriesActive,
  watchlistActive,
  handleWatchlist,
}: NavState) => {
  return (
    <nav aria-label="Principal" className="flex items-center gap-0.5">
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
  layout: AccountLayout
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
          "flex min-w-0 items-center rounded-full text-[13px] font-semibold transition-colors duration-[150ms]",
          prefsActive
            ? "cursor-default bg-paper text-void"
            : "cursor-pointer bg-white/8 text-white hover:bg-white/16",
          layout === "compact"
            ? "gap-1.5 py-[5px] pr-2.5 pl-[5px]"
            : "gap-[9px] p-[5px] lg:py-[5px] lg:pr-[14px] lg:pl-[5px]",
        )}
      >
        <span
          className={cn(
            "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
            prefsActive ? "bg-void text-paper" : "bg-white/18 text-white",
          )}
        >
          {initialsFromEmail(session.email)}
        </span>
        {layout === "compact" ? (
          <span className="max-w-[5.5rem] truncate">{shortNameFromEmail(session.email)}</span>
        ) : (
          <span className="hidden max-w-28 truncate lg:inline">{shortNameFromEmail(session.email)}</span>
        )}
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

const TabLink = ({
  href,
  active,
  icon: Icon,
  label,
}: {
  href: string
  active: boolean
  icon: TabIcon
  label: string
}) => {
  return (
    <ScreenLink href={href} aria-current={active ? "page" : undefined} className={tabClass(active)}>
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </ScreenLink>
  )
}

const NavLink = ({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) => {
  return (
    <ScreenLink href={href} aria-current={active ? "page" : undefined} className={navClass(active)}>
      {children}
    </ScreenLink>
  )
}

const tabClass = (active: boolean) => {
  return cn(
    "flex flex-col items-center justify-center gap-0.5 text-[10px] leading-none transition-colors duration-[150ms]",
    active
      ? "cursor-default font-semibold text-white"
      : "cursor-pointer font-medium text-white/60 hover:text-white",
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
