"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"

import { useAccount } from "@/components/account-provider"
import { useAppShell } from "@/components/app-shell-context"
import {
  BookmarkIcon,
  ChevronIcon,
  FilterIcon,
  LogoutIcon,
  SearchIcon,
  SlidersIcon,
} from "@/components/icons"
import { Wordmark } from "@/components/wordmark"
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
  const { filtersOpen, setFiltersOpen } = useAppShell()
  const searchQuery = searchParams.get("q") ?? ""
  const displayName = session?.email.split("@")[0] ?? "Você"
  const homeHref = preferences ? "/" : "/onboarding"
  const homeActive = pathname === "/" || pathname === "/onboarding"

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const term = String(new FormData(event.currentTarget).get("q") ?? "").trim()
    if (!term) return
    router.push(`/busca?q=${encodeURIComponent(term)}`)
  }

  return (
    <TopbarFrame>
      <Wordmark href={homeHref} className="shrink-0" />

      <nav className="hidden items-center sm:flex" aria-label="Principal">
        <NavLink href={homeHref} active={homeActive}>
          Início
        </NavLink>
      </nav>

      {preferences ? (
        <form
          onSubmit={handleSearch}
          className="focus-pill flex min-w-0 flex-1 items-center rounded-full bg-white/6 px-3 ring-1 ring-white/8"
          role="search"
        >
          <SearchIcon className="h-4 w-4 shrink-0 text-mist" />
          <label htmlFor="header-search" className="sr-only">
            Buscar título
          </label>
          <input
            id="header-search"
            name="q"
            type="search"
            defaultValue={searchQuery}
            key={searchQuery}
            placeholder="Buscar um título"
            className="h-11 w-full bg-transparent px-3 text-sm text-paper outline-none placeholder:text-mist/80"
          />
          {pathname === "/" ? (
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
              aria-controls="filtros-catalogo"
              className={cn(
                "press-pill inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-mist hover:bg-white/10 hover:text-paper",
                filtersOpen && "bg-white/10 text-paper",
              )}
              aria-label="Filtros"
            >
              <FilterIcon />
            </button>
          ) : null}
        </form>
      ) : (
        <div className="flex-1" />
      )}

      {preferences ? (
        <>
          <NavLink
            href="/watchlist"
            active={pathname === "/watchlist"}
            className="hidden sm:inline-flex"
          >
            Watchlist
          </NavLink>
          <Link
            href="/watchlist"
            aria-label="Watchlist"
            aria-current={pathname === "/watchlist" ? "page" : undefined}
            className={cn(
              "press-pill inline-flex h-10 w-10 items-center justify-center rounded-full sm:hidden",
              pathname === "/watchlist" ? "text-ember" : "text-mist hover:text-paper",
            )}
          >
            <BookmarkIcon className="h-5 w-5" />
          </Link>
        </>
      ) : null}

      <ProfileMenu displayName={displayName} showPreferences={Boolean(preferences)} />
    </TopbarFrame>
  )
}

const TopbarFrame = ({ children }: { children?: React.ReactNode }) => {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-stage/90 px-4 py-3 backdrop-blur-xl sm:px-6 sm:gap-4 lg:px-7">
      {children ?? <div className="h-11 flex-1" />}
    </header>
  )
}

const NavLink = ({
  href,
  active,
  className,
  children,
}: {
  href: string
  active: boolean
  className?: string
  children: React.ReactNode
}) => {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative shrink-0 px-3 py-2 text-sm font-medium transition-colors duration-ui",
        active ? "text-ember" : "text-mist hover:text-paper",
        className,
      )}
    >
      {children}
      {active ? (
        <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-ember" />
      ) : null}
    </Link>
  )
}

const ProfileMenu = ({
  displayName,
  showPreferences,
}: {
  displayName: string
  showPreferences: boolean
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useAccount()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const initial = displayName.slice(0, 1).toUpperCase()

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const handleSignOut = () => {
    signOut()
    setOpen(false)
    router.replace("/login")
  }

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        className="press-pill flex items-center gap-2 rounded-full"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="menu-perfil"
        aria-label="Menu da conta"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="hidden max-w-32 truncate text-sm font-medium text-paper sm:block">
          {displayName}
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ember text-sm font-semibold text-white">
          {initial}
        </span>
        <ChevronIcon
          className={cn(
            "hidden h-4 w-4 text-mist transition-transform duration-ui sm:block",
            open && "rotate-90",
          )}
        />
      </button>
      {open ? (
        <div
          id="menu-perfil"
          role="menu"
          aria-label="Conta"
          className="glass absolute top-full right-0 z-30 mt-2 min-w-48 rounded-2xl p-1.5"
        >
          {showPreferences ? (
            <Link
              href="/preferencias"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-ui",
                pathname === "/preferencias"
                  ? "bg-white/8 text-paper"
                  : "text-mist hover:bg-white/6 hover:text-paper",
              )}
            >
              <SlidersIcon className="h-4 w-4" />
              Preferências
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mist transition-colors duration-ui hover:bg-white/6 hover:text-paper"
          >
            <LogoutIcon className="h-4 w-4" />
            Sair
          </button>
        </div>
      ) : null}
    </div>
  )
}
