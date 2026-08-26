"use client"

import { useRouter } from "next/navigation"

import { useAccount } from "@/components/account-provider"
import { AuthForm, AuthLinks } from "@/components/auth-form"

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAccount()

  return (
    <AuthForm
      title="Entrar"
      submitLabel="Entrar"
      fields={[
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        { name: "password", label: "Senha", type: "password", autoComplete: "current-password" },
      ]}
      onSubmit={(values) => {
        const session = signIn(values.email, values.password)
        if (session.status === "email_pending") {
          router.replace("/verificar-email")
          return
        }
        router.replace("/")
      }}
      footer={
        <AuthLinks
          items={[
            { href: "/cadastro", label: "Criar conta" },
            { href: "/recuperar-senha", label: "Esqueci a senha" },
          ]}
        />
      }
    />
  )
}
