import type { WatchProvider } from "@/lib/catalog/types"

type OnboardingProviderMatch = {
  label: string
  match: (normalizedName: string) => boolean
}

const normalizeProviderName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\+/g, " plus")
    .replace(/\s+/g, " ")
    .trim()

const ONBOARDING_PROVIDER_MATCHES: OnboardingProviderMatch[] = [
  {
    label: "Netflix",
    match: (name) => name === "netflix",
  },
  {
    label: "Prime Video",
    match: (name) => name === "prime video" || name === "amazon prime video",
  },
  {
    label: "Max",
    match: (name) => name === "max" || name === "hbo max",
  },
  {
    label: "Disney+",
    match: (name) => name === "disney plus",
  },
  {
    label: "Globoplay",
    match: (name) => name === "globoplay",
  },
  {
    label: "Apple TV+",
    match: (name) => name === "apple tv plus" || name === "apple tv",
  },
  {
    label: "Paramount+",
    match: (name) => name === "paramount plus",
  },
  {
    label: "Telecine",
    match: (name) => name === "telecine",
  },
]

export const toOnboardingProviders = (providers: WatchProvider[]): WatchProvider[] => {
  return ONBOARDING_PROVIDER_MATCHES.flatMap((entry) => {
    const matches = providers.filter((provider) =>
      entry.match(normalizeProviderName(provider.name)),
    )

    if (matches.length === 0) return []

    const preferred =
      matches.find((provider) => normalizeProviderName(provider.name) === normalizeProviderName(entry.label)) ??
      matches[0]

    return [{ ...preferred, name: entry.label }]
  })
}
