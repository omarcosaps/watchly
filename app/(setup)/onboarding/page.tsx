import { PreferencesForm } from "@/components/preferences-form"

export default function OnboardingPage() {
  return (
    <div className="fade-up w-full max-w-[720px]">
      <p className="text-[15px] font-extrabold tracking-[-0.02em] text-white/50">Watchly</p>
      <h1 className="mt-2.5 text-[34px] font-black tracking-[-0.03em] text-paper">
        Onde você assiste?
      </h1>
      <p className="mt-1.5 mb-7 text-[15px] text-white/55">
        Escolha seu país e os streamings que você assina. Dá pra mudar depois, sem perder a
        watchlist.
      </p>
      <PreferencesForm submitLabel="Continuar" layout="onboarding" />
    </div>
  )
}
