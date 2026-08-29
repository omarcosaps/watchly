import Link from "next/link"

import { WatchlyMark } from "@/components/icons"
import { cn } from "@/lib/cn"

type WordmarkProps = {
  href?: string
  className?: string
  showText?: boolean
}

export const Wordmark = ({ href = "/", className, showText = true }: WordmarkProps) => {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-[12px] text-paper", className)}
      aria-label="Watchly, início"
    >
      <WatchlyMark className="h-7 w-7" />
      {showText ? (
        <span className="hidden text-lg font-semibold tracking-tight sm:inline">Watchly</span>
      ) : null}
    </Link>
  )
}
