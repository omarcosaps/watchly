"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { useAccount } from "@/components/account-provider"

export const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { ready, session, preferences } = useAccount()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return

    if (pathname === "/verificar-email") {
      router.replace("/login")
      return
    }

    if (session) {
      router.replace(preferences ? "/" : "/onboarding")
    }
  }, [pathname, preferences, ready, router, session])

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-mist" role="status">
        Carregando a sessão
      </div>
    )
  }

  if (pathname === "/verificar-email") return null
  if (session) return null

  return <>{children}</>
}
