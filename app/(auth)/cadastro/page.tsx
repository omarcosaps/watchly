"use client"

import { useRouter } from "next/navigation"

import { useAccount } from "@/components/account-provider"
import { AuthForm, AuthLinks } from "@/components/auth-form"

export default function CadastroPage() {
  const router = useRouter()
  const { signUp } = useAccount()

  return (
    <AuthForm
      title="Criar conta"
      submitLabel="Criar conta"
      fields={[
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        { name: "password", label: "Senha", type: "password", autoComplete: "new-password" },
      ]}
      onSubmit={(values) => {
        const session = signUp(values.email, values.password)
        if (session.status === "email_pending") {
          router.replace("/verificar-email")
          return
        }
        router.replace("/onboarding")
      }}
      footer={<AuthLinks items={[{ href: "/login", label: "Já tenho conta" }]} />}
    />
  )
}
