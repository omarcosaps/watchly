import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { resetAccountSnapshot } from "@/lib/account/store"
import { createAccountTestDouble } from "@/lib/account/test-double"
import { AccountError } from "@/lib/account/types"

const testDouble = createAccountTestDouble()

vi.mock("@/lib/account/supabase/client", () => ({
  getAccountClient: () => testDouble,
}))

import { requestPasswordReset, signIn, signOut, signUp } from "@/lib/account/session"
import { addToWatchlist, listWatchlist } from "@/lib/account/watchlist"
import { savePreferences } from "@/lib/account/preferences"

beforeEach(() => {
  resetAccountSnapshot()
  Object.assign(testDouble, createAccountTestDouble())
})

afterEach(() => {
  resetAccountSnapshot()
})

describe("signUp", () => {
  it("exige origem de aquisição", async () => {
    await expect(signUp("a@watchly.app", "123456", "")).rejects.toBeInstanceOf(AccountError)
    await expect(signUp("a@watchly.app", "123456", "")).rejects.toThrow(
      "Conte onde você conheceu o Watchly.",
    )
  })

  it("bloqueia email já usado", async () => {
    await signUp("a@watchly.app", "123456", "amigo")
    await signOut()

    await expect(signUp("a@watchly.app", "654321", "redes")).rejects.toThrow(
      "Já existe uma conta com esse email. Use Entrar.",
    )
  })
})

describe("signIn", () => {
  it("não encontra conta que ainda não foi criada", async () => {
    await expect(signIn("nova@watchly.app", "123456")).rejects.toThrow(
      "Conta não encontrada. Crie uma conta primeiro.",
    )
  })

  it("rejeita senha errada", async () => {
    await signUp("a@watchly.app", "123456", "amigo")
    await signOut()

    await expect(signIn("a@watchly.app", "errada")).rejects.toThrow("Senha incorreta.")
  })
})

describe("requestPasswordReset", () => {
  it("não revela se a conta existe", async () => {
    await expect(requestPasswordReset("nova@watchly.app")).resolves.toBeUndefined()
  })
})

describe("isolamento por conta", () => {
  it("mantém watchlist e preferências de cada email", async () => {
    await signUp("um@watchly.app", "123456", "amigo")
    await savePreferences({ country: "BR", providerIds: [8] })
    await addToWatchlist({
      tmdbId: 1,
      mediaType: "movie",
      title: "Duna",
      posterPath: null,
      year: 2021,
    })
    await signOut()

    await signUp("dois@watchly.app", "123456", "google")
    expect(listWatchlist()).toEqual([])
    await savePreferences({ country: "US", providerIds: [9] })
    await signOut()

    await signIn("um@watchly.app", "123456")
    expect(listWatchlist()).toHaveLength(1)
    expect(listWatchlist()[0]?.title).toBe("Duna")
  })
})
