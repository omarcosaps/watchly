import Link from "next/link"

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
      className={cn("flex items-center gap-3 text-paper", className)}
      aria-label="Watchly, início"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ember text-lg font-bold tracking-tight text-white shadow-[0_10px_24px_rgb(229_9_20/0.42)]">
        W
      </span>
      {showText ? (
        <span className="text-lg font-semibold tracking-tight">Watchly</span>
      ) : null}
    </Link>
  )
}
