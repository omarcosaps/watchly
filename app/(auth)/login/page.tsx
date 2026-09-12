"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { useAccount } from "@/components/account-provider"
import { AuthForm, AuthIntentNotice, AuthSwitch, ExploreAsGuest } from "@/components/auth-form"

const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAccount()
  const intent = searchParams.get("intent")

  return (
    <>
      <AuthForm
        title="Login"
        subtitle="Acesse sua conta para continuar"
        submitLabel="Entrar"
        notice={<AuthIntentNotice intent={intent} />}
        fields={[
          { name: "email", label: "E-mail", type: "email", autoComplete: "email" },
          { name: "password", label: "Senha", type: "password", autoComplete: "current-password" },
        ]}
        onSubmit={(values) => {
          signIn(values.email, values.password)
          router.replace("/onboarding")
        }}
        beforeSubmit={
          <Link
            href="/recuperar-senha"
            className="self-start text-[13.5px] text-white/55 underline underline-offset-[3px] hover:text-white"
          >
            Esqueci minha senha
          </Link>
        }
        footer={<AuthSwitch prompt="Novo por aqui?" href="/cadastro" label="Criar conta" />}
      />
      <ExploreAsGuest />
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
