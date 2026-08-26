"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { useAccount } from "@/components/account-provider"
import { useAppShell } from "@/components/app-shell-context"
import {
  BookmarkIcon,
  CloseIcon,
  CompassIcon,
  HomeIcon,
  LogoutIcon,
  SlidersIcon,
} from "@/components/icons"
import { Wordmark } from "@/components/wordmark"
import { cn } from "@/lib/cn"

export const AppSidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, preferences } = useAccount()
  const { navOpen, setNavOpen } = useAppShell()
  const homeHref = preferences ? "/" : "/onboarding"

  const handleSignOut = () => {
    signOut()
    setNavOpen(false)
    router.replace("/login")
  }

  const handleNavigate = () => {
    setNavOpen(false)
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-full w-[15.5rem] flex-col overflow-y-auto border-r border-white/6 bg-stage px-4 py-5 transition-transform duration-300 lg:static lg:translate-x-0",
        navOpen ? "translate-x-0" : "-translate-x-full",
      )}
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-between">
        <Wordmark href={homeHref} />
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-mist lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setNavOpen(false)}
        >
          <CloseIcon />
        </button>
      </div>

      <nav className="mt-8 flex min-h-0 flex-1 flex-col">
        <NavSection label="Menu">
          <NavItem
            href={homeHref}
            active={pathname === "/" || pathname === "/onboarding"}
            icon={<HomeIcon />}
            onClick={handleNavigate}
          >
            Início
          </NavItem>
          {preferences ? (
            <NavItem
              href="/busca"
              active={pathname === "/busca"}
              icon={<CompassIcon />}
              onClick={handleNavigate}
            >
              Busca
            </NavItem>
          ) : null}
        </NavSection>

        {preferences ? (
          <NavSection label="Biblioteca">
            <NavItem
              href="/watchlist"
              active={pathname === "/watchlist"}
              icon={<BookmarkIcon />}
              onClick={handleNavigate}
            >
              Watchlist
            </NavItem>
          </NavSection>
        ) : null}

        <div className="mt-auto">
          <NavSection label="Geral">
            {preferences ? (
              <NavItem
                href="/preferencias"
                active={pathname === "/preferencias"}
                icon={<SlidersIcon />}
                onClick={handleNavigate}
              >
                Preferências
              </NavItem>
            ) : null}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-mist transition-colors duration-200 hover:bg-white/6 hover:text-paper"
            >
              <LogoutIcon />
              Sair
            </button>
          </NavSection>
        </div>
      </nav>
    </aside>
  )
}

const NavSection = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => {
  return (
    <div className="mb-6">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-mist/70">
        {label}
      </p>
      <div className="mt-2 flex flex-col gap-1">{children}</div>
    </div>
  )
}

const NavItem = ({
  href,
  active,
  icon,
  onClick,
  children,
}: {
  href: string
  active: boolean
  icon: React.ReactNode
  onClick: () => void
  children: React.ReactNode
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors duration-200",
        active ? "bg-ember/12 text-ember" : "text-mist hover:bg-white/6 hover:text-paper",
      )}
    >
      {icon}
      {children}
      {active ? (
        <span className="absolute top-1/2 right-0 h-6 w-1 -translate-y-1/2 rounded-full bg-ember" />
      ) : null}
    </Link>
  )
}
