"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function VerificarEmailPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/login")
  }, [router])

  return (
    <p className="text-sm text-mist" role="status">
      Redirecionando para o login
    </p>
  )
}
