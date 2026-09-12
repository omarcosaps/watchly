"use client"

import { useState } from "react"

import { useAccount } from "@/components/account-provider"
import { AuthForm, AuthSwitch, ExploreAsGuest } from "@/components/auth-form"

export default function RecuperarSenhaPage() {
  const { requestPasswordReset } = useAccount()
  const [success, setSuccess] = useState<string | null>(null)

  return (
    <>
      <AuthForm
        title="Recuperar senha"
        subtitle="Enviamos um link para você criar uma senha nova"
        submitLabel="Enviar link de redefinição"
        success={success}
        fields={[{ name: "email", label: "E-mail", type: "email", autoComplete: "email" }]}
        onSubmit={(values) => {
          requestPasswordReset(values.email)
          setSuccess(
            `Se existir uma conta para ${values.email.trim().toLowerCase()}, enviamos um link de redefinição de senha.`,
          )
        }}
        footer={
          <div className="flex flex-col gap-2">
            <AuthSwitch href="/atualizar-senha" label="Já tenho o link de redefinição" />
            <AuthSwitch prompt="Lembrou a senha?" href="/login" label="Voltar para o login" />
          </div>
        }
      />
      <ExploreAsGuest />
    </>
  )
}
