export const MOTION_OUT = 260
export const HERO_SEEN_MS = 1100
export const HOME_STAGGER_MS = 1500

export const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export const isModifiedClick = (event: {
  altKey: boolean
  button: number
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}) => {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
}

export const cardEnterDelay = (index: number) => {
  return `${(0.4 + Math.min(index, 11) * 0.035).toFixed(3)}s`
}

export const hrefPathname = (href: string) => {
  const withoutHash = href.split("#")[0] ?? href
  const path = (withoutHash.split("?")[0] ?? withoutHash).trim()
  if (path === "" || path === "/") return "/"
  return path.replace(/\/+$/, "") || "/"
}

export const hrefSearch = (href: string) => {
  const withoutHash = href.split("#")[0] ?? href
  const query = withoutHash.split("?")[1] ?? ""
  return new URLSearchParams(query)
}

export const currentLocationHref = (pathname: string, search = "") => {
  const query = search.startsWith("?") ? search.slice(1) : search
  return query ? `${pathname}?${query}` : pathname
}

export const screenIdentity = (href: string) => {
  const path = hrefPathname(href)
  if (path === "/") {
    const media = hrefSearch(href).get("media")
    if (media === "movie") return "home:movie"
    if (media === "tv") return "home:tv"
    return "home"
  }
  if (path === "/busca") return "search"
  if (path === "/watchlist") return "watchlist"
  if (path === "/preferencias") return "profile"
  const title = path.match(/^\/titulo\/([^/]+)\/([^/]+)$/)
  if (title?.[1] && title[2]) return `title:${title[1]}:${title[2]}`
  return null
}

export const isAppScreenTransition = (fromHref: string, toHref: string) => {
  const from = screenIdentity(fromHref)
  const to = screenIdentity(toHref)
  if (from === null || to === null) return false
  return from !== to
}

export const titleHrefParts = (href: string) => {
  const path = hrefPathname(href)
  const match = path.match(/^\/titulo\/([^/]+)\/([^/]+)$/)
  if (!match?.[1] || !match[2]) return null
  return { tipo: match[1], id: match[2] }
}
