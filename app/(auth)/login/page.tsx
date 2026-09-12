"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { useAccount } from "@/components/account-provider"
import { AuthForm, AuthIntentNotice, AuthLinks, ExploreAsGuest } from "@/components/auth-form"

const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAccount()
  const intent = searchParams.get("intent")

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <AuthIntentNotice intent={intent} />
      <AuthForm
        title="Login"
        subtitle="Acesse sua conta para continuar"
        submitLabel="Entrar"
        fields={[
          { name: "email", label: "E-mail", type: "email", autoComplete: "email" },
          { name: "password", label: "Senha", type: "password", autoComplete: "current-password" },
        ]}
        onSubmit={(values) => {
          signIn(values.email, values.password)
          router.replace("/onboarding")
        }}
        footer={
          <div className="flex flex-col gap-3">
            <AuthLinks
              items={[
                { href: "/recuperar-senha", label: "Esqueci minha senha" },
                { href: "/cadastro", label: "Novo por aqui? Criar conta" },
              ]}
            />
            <ExploreAsGuest />
          </div>
        }
      />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
