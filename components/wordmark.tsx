"use client"

import { ScreenLink } from "@/components/screen-link"
import { cn } from "@/lib/cn"

type WordmarkProps = {
  href?: string
  className?: string
}

export const Wordmark = ({ href = "/", className }: WordmarkProps) => {
  return (
    <ScreenLink
      href={href}
      className={cn(
        "shrink-0 px-2.5 text-base font-bold tracking-[-0.02em] text-white",
        className,
      )}
      aria-label="Watchly, início"
    >
      Watchly
    </ScreenLink>
  )
}
