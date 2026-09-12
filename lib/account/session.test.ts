import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { STORAGE_KEY } from "@/lib/account/mock/storage"
import { signIn, signOut, signUp } from "@/lib/account/session"
import { AccountError } from "@/lib/account/types"
import { addToWatchlist, listWatchlist } from "@/lib/account/watchlist"
import { savePreferences } from "@/lib/account/preferences"

const createMemoryStorage = () => {
  const data = new Map<string, string>()

  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
    removeItem: (key: string) => {
      data.delete(key)
    },
    clear: () => {
      data.clear()
    },
  }
}

beforeEach(() => {
  vi.stubGlobal("window", { localStorage: createMemoryStorage() })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("signUp", () => {
  it("exige origem de aquisição", () => {
    expect(() => signUp("a@watchly.app", "123456", "")).toThrow(AccountError)
    expect(() => signUp("a@watchly.app", "123456", "")).toThrow(
      "Conte onde você conheceu o Watchly.",
    )
  })

  it("bloqueia email já usado", () => {
    signUp("a@watchly.app", "123456", "amigo")
    signOut()

    expect(() => signUp("a@watchly.app", "654321", "redes")).toThrow(
      "Já existe uma conta com esse email. Use Entrar.",
    )
  })
})

describe("signIn", () => {
  it("não encontra conta que ainda não foi criada", () => {
    expect(() => signIn("nova@watchly.app", "123456")).toThrow(
      "Conta não encontrada. Crie uma conta primeiro.",
    )
  })

  it("rejeita senha errada", () => {
    signUp("a@watchly.app", "123456", "amigo")
    signOut()

    expect(() => signIn("a@watchly.app", "errada")).toThrow("Senha incorreta.")
  })
})

describe("isolamento por conta", () => {
  it("mantém watchlist e preferências de cada email", () => {
    signUp("um@watchly.app", "123456", "amigo")
    savePreferences({ country: "BR", providerIds: [8] })
    addToWatchlist({
      tmdbId: 1,
      mediaType: "movie",
      title: "Duna",
      posterPath: null,
      year: 2021,
    })
    signOut()

    signUp("dois@watchly.app", "123456", "google")
    expect(listWatchlist()).toEqual([])
    savePreferences({ country: "US", providerIds: [9] })
    signOut()

    signIn("um@watchly.app", "123456")
    expect(listWatchlist()).toHaveLength(1)
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}").session.email).toBe(
      "um@watchly.app",
    )
  })
})
