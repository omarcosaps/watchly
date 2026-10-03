"use client"

import { PreferencesForm } from "@/components/preferences-form"
import { useEnterCascade } from "@/hooks/use-enter-cascade"

export default function PreferenciasPage() {
  const enter = useEnterCascade()

  return (
    <div className="mx-auto max-w-[720px] pt-[var(--content-gap)] sm:pt-0">
      <PreferencesForm
        submitLabel="Salvar preferências"
        showAccount
        showLogout
        enter={enter}
      />
    </div>
  )
}
