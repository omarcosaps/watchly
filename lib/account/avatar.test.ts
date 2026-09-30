import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getAccountSnapshot, resetAccountSnapshot } from "@/lib/account/store"
import { createAccountTestDouble } from "@/lib/account/test-double"
import { AccountError } from "@/lib/account/types"
import { AVATAR_MAX_BYTES } from "@/lib/account/validation"

const testDouble = createAccountTestDouble()

vi.mock("@/lib/account/supabase/client", () => ({
  getAccountClient: () => testDouble,
}))

import { removeAvatar, saveAvatar } from "@/lib/account/avatar"
import { signIn, signOut, signUp } from "@/lib/account/session"
import { hydrateAccount } from "@/lib/account/supabase/load"

const photo = (type: string, name: string, bytes = 8) => {
  return new File([new Uint8Array(bytes)], name, { type })
}

const jpeg = () => photo("image/jpeg", "photo.jpg")

beforeEach(async () => {
  resetAccountSnapshot()
  Object.assign(testDouble, createAccountTestDouble())
  await signUp("qa@watchly.app", "123456", "amigo")
})

afterEach(() => {
  resetAccountSnapshot()
})

describe("saveAvatar", () => {
  it("rejeita tipo inválido sem chamar o Storage e sem mudar a URL", async () => {
    const url = await saveAvatar(jpeg())
    const calls = [...testDouble.storageCalls]

    await expect(saveAvatar(photo("image/gif", "photo.gif"))).rejects.toBeInstanceOf(AccountError)
    await expect(saveAvatar(photo("image/gif", "photo.gif"))).rejects.toThrow(
      "Escolha uma foto em JPG, PNG ou WebP.",
    )

    expect(testDouble.storageCalls).toEqual(calls)
    expect(getAccountSnapshot().avatarUrl).toBe(url)
  })

  it("rejeita arquivo acima de 2 MB sem chamar o Storage e sem mudar a URL", async () => {
    const url = await saveAvatar(jpeg())
    const calls = [...testDouble.storageCalls]

    await expect(saveAvatar(photo("image/jpeg", "big.jpg", AVATAR_MAX_BYTES + 1))).rejects.toThrow(
      "A foto precisa ter no máximo 2 MB.",
    )

    expect(testDouble.storageCalls).toEqual(calls)
    expect(getAccountSnapshot().avatarUrl).toBe(url)
  })

  it("grava o caminho e publica a URL", async () => {
    const url = await saveAvatar(jpeg())
    const row = testDouble.avatarRow()

    expect(row?.object_path).toBe(`${row?.user_id}/avatar`)
    expect(url).toBe(
      `https://storage.test/avatars/${row?.object_path}?v=${encodeURIComponent(row?.updated_at ?? "")}`,
    )
    expect(getAccountSnapshot().avatarUrl).toBe(url)
    expect(testDouble.storageCalls).toContain("upload")
  })

  it("aceita PNG e WebP", async () => {
    await saveAvatar(photo("image/png", "photo.png"))
    const pngUrl = getAccountSnapshot().avatarUrl

    await saveAvatar(photo("image/webp", "photo.webp"))

    expect(pngUrl).toContain("/avatar?v=")
    expect(getAccountSnapshot().avatarUrl).toContain("/avatar?v=")
    expect(getAccountSnapshot().avatarUrl).not.toBe(pngUrl)
  })

  it("mantém a URL anterior se o upload falha", async () => {
    const url = await saveAvatar(jpeg())
    const row = testDouble.avatarRow()
    testDouble.failNextOperation("storage-upload")

    await expect(saveAvatar(jpeg())).rejects.toThrow("Não deu para salvar a foto.")

    expect(getAccountSnapshot().avatarUrl).toBe(url)
    expect(testDouble.avatarRow()).toEqual(row)
  })

  it("mantém a URL anterior se a linha falha", async () => {
    const url = await saveAvatar(jpeg())
    const row = testDouble.avatarRow()
    testDouble.failNextOperation("avatar-write")

    await expect(saveAvatar(jpeg())).rejects.toThrow("Não deu para salvar a foto.")

    expect(getAccountSnapshot().avatarUrl).toBe(url)
    expect(testDouble.avatarRow()).toEqual(row)
  })
})

describe("removeAvatar", () => {
  it("deixa avatarUrl nulo quando Storage e linha são apagados", async () => {
    await saveAvatar(jpeg())

    await removeAvatar()

    expect(getAccountSnapshot().avatarUrl).toBeNull()
    expect(testDouble.avatarRow()).toBeNull()
    expect(testDouble.storageCalls).toContain("remove")
  })

  it("mantém a URL anterior se o Storage falha", async () => {
    const url = await saveAvatar(jpeg())
    const row = testDouble.avatarRow()
    testDouble.failNextOperation("storage-remove")

    await expect(removeAvatar()).rejects.toThrow("Não deu para remover a foto.")

    expect(getAccountSnapshot().avatarUrl).toBe(url)
    expect(testDouble.avatarRow()).toEqual(row)
  })

  it("mantém a URL anterior se a linha falha", async () => {
    const url = await saveAvatar(jpeg())
    const row = testDouble.avatarRow()
    testDouble.failNextOperation("avatar-delete")

    await expect(removeAvatar()).rejects.toThrow("Não deu para remover a foto.")

    expect(getAccountSnapshot().avatarUrl).toBe(url)
    expect(testDouble.avatarRow()).toEqual(row)
  })
})

describe("hydrateAccount", () => {
  it("devolve a mesma URL ao hidratar de novo", async () => {
    const url = await saveAvatar(jpeg())
    resetAccountSnapshot()

    await hydrateAccount()

    expect(getAccountSnapshot().avatarUrl).toBe(url)
  })

  it("zera a URL ao sair e a recupera ao entrar de novo", async () => {
    const url = await saveAvatar(jpeg())

    await signOut()

    expect(getAccountSnapshot().avatarUrl).toBeNull()

    await signIn("qa@watchly.app", "123456")

    expect(getAccountSnapshot().avatarUrl).toBe(url)
    expect(testDouble.avatarRow()?.object_path).toBe(`${testDouble.avatarRow()?.user_id}/avatar`)
  })
})
