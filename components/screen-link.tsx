"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import type { ComponentProps, MouseEvent } from "react"

import { usePageMotionOptional } from "@/components/page-motion"
import { useScreenNavigate } from "@/hooks/use-screen-navigate"
import { currentLocationHref, isAppScreenTransition, isModifiedClick } from "@/lib/motion"

type ScreenLinkProps = ComponentProps<typeof Link>

export const ScreenLink = ({ href, onClick, ...props }: ScreenLinkProps) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pageMotion = usePageMotionOptional()
  const { leaveTo } = useScreenNavigate()
  const hrefValue = typeof href === "string" ? href : (href.pathname ?? "/")
  const currentHref = pageMotion?.currentHref ?? currentLocationHref(pathname, searchParams.toString())

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (isModifiedClick(event)) return
    if (!isAppScreenTransition(currentHref, hrefValue)) return
    event.preventDefault()
    leaveTo(hrefValue)
  }

  return <Link href={href} onClick={handleClick} {...props} />
}
