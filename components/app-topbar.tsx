"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"

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
      <Wordmark href="/" className="shrink-0" />

      <nav className="flex min-w-0 items-center gap-1 overflow-x-auto" aria-label="Principal">
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
          className={cn(
            "relative shrink-0 px-3 py-2 text-sm font-medium transition-colors duration-ui",
            pathname === "/watchlist" ? "text-paper" : "text-mist hover:text-paper",
          )}
        >
          Watchlist
        </button>
      </nav>

      <div className="flex flex-1 justify-end" />

      <Link
        href="/busca"
        aria-label="Buscar"
        aria-current={pathname === "/busca" ? "page" : undefined}
        className={cn(
          "press-pill inline-flex h-10 w-10 items-center justify-center rounded-full text-mist hover:text-paper",
          pathname === "/busca" && "text-paper",
        )}
      >
        <SearchIcon className="h-5 w-5" />
      </Link>

      {session ? (
        <ProfileMenu email={session.email} />
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="press-pill hidden h-10 items-center rounded-full px-4 text-sm font-semibold text-mist hover:text-paper sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="cta-primary press-pill inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold"
          >
            Criar conta
          </Link>
        </div>
      )}
    </TopbarFrame>
  )
}

const TopbarFrame = ({ children }: { children?: React.ReactNode }) => {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-void/90 px-4 py-3 backdrop-blur-xl sm:px-6 sm:gap-4 lg:px-7">
      {children ?? <div className="h-11 flex-1" />}
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
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative shrink-0 px-3 py-2 text-sm font-medium transition-colors duration-ui",
        active ? "text-paper" : "text-mist hover:text-paper",
      )}
    >
      {children}
      {active ? (
        <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-paper" />
      ) : null}
    </Link>
  )
}

const ProfileMenu = ({ email }: { email: string }) => {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useAccount()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const shortName = email.split("@")[0] ?? "Você"
  const initials = shortName.slice(0, 2).toUpperCase()

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
    router.replace("/")
  }

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        className="press-pill flex items-center gap-2 rounded-full bg-white/6 py-1 pr-3 pl-1"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="menu-perfil"
        aria-label="Menu da conta"
        title="Sua conta e preferências"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-xs font-semibold text-paper">
          {initials}
        </span>
        <span className="hidden max-w-28 truncate text-sm font-semibold text-paper sm:inline">
          {shortName}
        </span>
      </button>
      {open ? (
        <div
          id="menu-perfil"
          role="menu"
          aria-label="Conta"
          className="glass-stage absolute top-full right-0 z-30 mt-2 min-w-48 rounded-2xl p-1.5"
        >
          <Link
            href="/preferencias"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center rounded-xl px-3 py-2.5 text-sm text-paper transition-colors duration-ui hover:bg-white/8",
              pathname === "/preferencias" && "bg-white/8",
            )}
          >
            Perfil
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm text-paper transition-colors duration-ui hover:bg-white/8"
          >
            Sair da conta
          </button>
        </div>
      ) : null}
    </div>
  )
}
