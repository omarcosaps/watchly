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
