"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { useAccount } from "@/components/account-provider"
import { usePageMotionOptional } from "@/components/page-motion"
import { GUEST_PREFERENCES } from "@/lib/account/types"
import { fetchTitle, warmHome } from "@/lib/api"
import {
  currentLocationHref,
  isAppScreenTransition,
  screenIdentity,
  titleHrefParts,
} from "@/lib/motion"

export const useScreenNavigate = () => {
  const pageMotion = usePageMotionOptional()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentHref = pageMotion?.currentHref ?? currentLocationHref(pathname, searchParams.toString())
  const { preferences } = useAccount()
  const catalogPreferences = preferences ?? GUEST_PREFERENCES

  const leaveTo = (href: string) => {
    if (!pageMotion || !isAppScreenTransition(currentHref, href)) {
      router.push(href)
      return
    }

    router.prefetch(href)
    const title = titleHrefParts(href)
    if (title) {
      void fetchTitle(catalogPreferences, title.tipo, title.id)
    } else if (screenIdentity(href)?.startsWith("home")) {
      void warmHome(catalogPreferences, href)
    }

    pageMotion.leaveThen(() => {
      router.push(href)
    })
  }

  return { leaveThen: pageMotion?.leaveThen, leaveTo }
}
