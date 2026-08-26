"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { useAccount } from "@/components/account-provider"
import { useAppShell } from "@/components/app-shell-context"
import { FilterIcon, MenuIcon, SearchIcon } from "@/components/icons"
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
  const { setNavOpen, filtersOpen, setFiltersOpen } = useAppShell()
  const searchQuery = searchParams.get("q") ?? ""
  const media = searchParams.get("media") ?? ""
  const displayName = session?.email.split("@")[0] ?? "Você"

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const term = String(new FormData(event.currentTarget).get("q") ?? "").trim()
    if (!term) return
    router.push(`/busca?q=${encodeURIComponent(term)}`)
  }

  const handleMediaTab = (value: "movie" | "tv") => {
    const nextValue = media === value ? "" : value

    if (pathname === "/") {
      const next = new URLSearchParams(searchParams.toString())
      if (!nextValue) next.delete("media")
      else next.set("media", nextValue)
      const queryString = next.toString()
      router.replace(queryString ? `/?${queryString}` : "/")
      return
    }

    router.push(nextValue ? `/?media=${nextValue}` : "/")
  }

  return (
    <TopbarFrame>
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-paper hover:bg-white/8"
          aria-label="Abrir menu"
        >
          <MenuIcon />
        </button>
      </div>

      {preferences ? (
        <nav className="hidden items-center gap-1 md:flex" aria-label="Tipo de título">
          <MediaTab
            active={media === "movie"}
            onClick={() => handleMediaTab("movie")}
          >
            Filmes
          </MediaTab>
          <MediaTab
            active={media === "tv"}
            onClick={() => handleMediaTab("tv")}
          >
            Séries
          </MediaTab>
        </nav>
      ) : null}

      {preferences ? (
        <form
          onSubmit={handleSearch}
          className="flex min-w-0 flex-1 items-center rounded-full bg-white/6 px-3 ring-1 ring-white/8"
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
            className="h-11 w-full bg-transparent px-3 text-sm text-paper placeholder:text-mist/80"
          />
          {pathname === "/" ? (
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
              aria-controls="filtros-catalogo"
              className={cn(
                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-mist transition-colors duration-200 hover:bg-white/10 hover:text-paper",
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

      <div className="flex items-center gap-3">
        <p className="hidden max-w-32 truncate text-sm font-medium text-paper sm:block">
          {displayName}
        </p>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-ember text-sm font-semibold text-white"
          aria-hidden
        >
          {displayName.slice(0, 1).toUpperCase()}
        </div>
      </div>
    </TopbarFrame>
  )
}

const TopbarFrame = ({ children }: { children?: React.ReactNode }) => {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-stage/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:gap-6 lg:px-7">
      {children ?? <div className="h-11 flex-1" />}
    </header>
  )
}

const MediaTab = ({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative px-3 py-2 text-sm font-medium transition-colors duration-200",
        active ? "text-ember" : "text-mist hover:text-paper",
      )}
    >
      {children}
      {active ? (
        <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-ember" />
      ) : null}
    </button>
  )
}
