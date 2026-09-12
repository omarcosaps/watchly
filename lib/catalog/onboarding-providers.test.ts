import { describe, expect, it } from "vitest"

import { toOnboardingProviders } from "./onboarding-providers"
import type { WatchProvider } from "./types"

const provider = (id: number, name: string): WatchProvider => ({
  id,
  name,
  logoPath: null,
})

describe("toOnboardingProviders", () => {
  it("mantém a ordem da referência e os labels curtos", () => {
    const result = toOnboardingProviders([
      provider(531, "Paramount Plus"),
      provider(8, "Netflix"),
      provider(337, "Disney+"),
      provider(119, "Amazon Prime Video"),
      provider(1899, "Max"),
      provider(307, "Globoplay"),
      provider(350, "Apple TV"),
      provider(227, "Telecine"),
      provider(10, "Amazon Video"),
    ])

    expect(result.map((item) => item.name)).toEqual([
      "Netflix",
      "Prime Video",
      "Max",
      "Disney+",
      "Globoplay",
      "Apple TV+",
      "Paramount+",
      "Telecine",
    ])
    expect(result.map((item) => item.id)).toEqual([8, 119, 1899, 337, 307, 350, 531, 227])
  })

  it("ignora canais e lojas com nome parecido", () => {
    const result = toOnboardingProviders([
      provider(8, "Netflix"),
      provider(9, "HBO Max Amazon Channel"),
      provider(10, "Apple TV Store"),
      provider(11, "Paramount+ Premium"),
      provider(12, "Google Play Movies"),
    ])

    expect(result.map((item) => item.name)).toEqual(["Netflix"])
  })

  it("omite o serviço se a TMDB não devolver o provedor", () => {
    const result = toOnboardingProviders([
      provider(8, "Netflix"),
      provider(337, "Disney Plus"),
    ])

    expect(result.map((item) => item.name)).toEqual(["Netflix", "Disney+"])
  })
})
