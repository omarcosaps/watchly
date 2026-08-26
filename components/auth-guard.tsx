"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { useAccount } from "@/components/account-provider"

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { ready, session, preferences } = useAccount()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return

    if (!session) {
      router.replace("/login")
      return
    }

    if (session.status === "email_pending") {
      router.replace("/verificar-email")
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

  if (!session || session.status === "email_pending") return null
  if (!preferences && pathname !== "/onboarding") return null
  if (preferences && pathname === "/onboarding") return null

  return <>{children}</>
}
