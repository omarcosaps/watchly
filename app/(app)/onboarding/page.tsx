import { PreferencesForm } from "@/components/preferences-form"

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-4xl font-semibold tracking-tight text-paper md:text-5xl">
        Onde você assiste?
      </h1>
      <p className="mt-3 max-w-xl text-mist">
        Escolha seu país e os streamings que você assina. Dá pra mudar depois, sem perder a
        watchlist.
      </p>
      <div className="mt-10">
        <PreferencesForm submitLabel="Continuar" />
      </div>
    </div>
  )
}
