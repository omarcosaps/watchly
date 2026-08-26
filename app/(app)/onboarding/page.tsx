import { PreferencesForm } from "@/components/preferences-form"

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm text-mist">Primeiro, o contexto</p>
      <h1 className="font-display mt-2 text-5xl italic tracking-tight text-paper md:text-6xl">
        Onde você assiste?
      </h1>
      <p className="mt-3 max-w-xl text-mist">
        Escolha o país e pelo menos um streaming. O catálogo só mostra o que existe aí, agora.
      </p>
      <div className="mt-10">
        <PreferencesForm submitLabel="Ver o catálogo" />
      </div>
    </div>
  )
}
