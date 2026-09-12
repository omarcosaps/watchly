"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { useAccount } from "@/components/account-provider"
import { loginHref } from "@/lib/account/pending-watchlist"

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { ready, session, preferences } = useAccount()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return

    if (!session) {
      router.replace(loginHref(pathname === "/watchlist" ? "watchlist" : "save"))
      return
    }

    if (!preferences && pathname !== "/onboarding") {
      router.replace("/onboarding")
      return
    }

    if (preferences && pathname === "/onboarding") {
      router.replace("/")
    }
  }, [pathname, preferences, ready, router, session])

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-mist" role="status">
        Carregando a sessão
      </div>
    )
  }

  if (!session) return null
  if (!preferences && pathname !== "/onboarding") return null
  if (preferences && pathname === "/onboarding") return null

  return <>{children}</>
}
