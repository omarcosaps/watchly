"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { useAccount } from "@/components/account-provider"
import { loginHref } from "@/lib/account/pending-watchlist"

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { ready, accountReady, loadError, retryAccount, session, preferences } = useAccount()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    if (session && !accountReady) return

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
  }, [accountReady, pathname, preferences, ready, router, session])

  if (!ready || (session && !accountReady && !loadError)) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-mist" role="status">
        Carregando a sessão
      </div>
    )
  }

  if (session && !accountReady && loadError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center" role="alert">
        <p className="text-mist">Não deu para carregar a conta.</p>
        <button
          type="button"
          onClick={() => {
            void retryAccount()
          }}
          className="cta-primary rounded-full px-[22px] py-3 text-sm font-bold"
        >
          Tentar de novo
        </button>
      </div>
    )
  }

  if (!session) return null
  if (!preferences && pathname !== "/onboarding") return null
  if (preferences && pathname === "/onboarding") return null

  return <>{children}</>
}
