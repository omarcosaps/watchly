import { describe, expect, it } from "vitest"

import {
  cardEnterDelay,
  isAppScreenTransition,
  isModifiedClick,
  screenIdentity,
  titleHrefParts,
} from "@/lib/motion"

describe("cardEnterDelay", () => {
  it("staggers the first twelve cards and caps afterwards", () => {
    expect(cardEnterDelay(0)).toBe("0.400s")
    expect(cardEnterDelay(1)).toBe("0.435s")
    expect(cardEnterDelay(11)).toBe("0.785s")
    expect(cardEnterDelay(12)).toBe("0.785s")
  })
})

describe("isModifiedClick", () => {
  it("ignores modified and non-primary clicks", () => {
    const base = {
      altKey: false,
      button: 0,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
    }

    expect(isModifiedClick(base)).toBe(false)
    expect(isModifiedClick({ ...base, metaKey: true })).toBe(true)
    expect(isModifiedClick({ ...base, button: 1 })).toBe(true)
  })
})

describe("screenIdentity", () => {
  it("distinguishes Início, Filmes and Séries by media", () => {
    expect(screenIdentity("/")).toBe("home")
    expect(screenIdentity("/?media=movie")).toBe("home:movie")
    expect(screenIdentity("/?media=tv")).toBe("home:tv")
    expect(screenIdentity("/?media=movie&genre=Aventura")).toBe("home:movie")
    expect(screenIdentity("/?sort=vote")).toBe("home")
  })

  it("keeps search query on the same screen", () => {
    expect(screenIdentity("/busca")).toBe("search")
    expect(screenIdentity("/busca?q=matrix")).toBe("search")
  })

  it("identifies each title by tipo and id", () => {
    expect(screenIdentity("/titulo/filme/1")).toBe("title:filme:1")
    expect(screenIdentity("/titulo/serie/9#elenco")).toBe("title:serie:9")
  })
})

describe("isAppScreenTransition", () => {
  it("animates Início, Filmes and Séries and ignores other home filters", () => {
    expect(isAppScreenTransition("/", "/?media=movie")).toBe(true)
    expect(isAppScreenTransition("/?media=movie", "/")).toBe(true)
    expect(isAppScreenTransition("/?media=movie", "/?media=tv")).toBe(true)
    expect(isAppScreenTransition("/?media=movie", "/?media=movie")).toBe(false)
    expect(isAppScreenTransition("/?media=movie", "/?media=movie&genre=Aventura")).toBe(false)
    expect(isAppScreenTransition("/busca", "/busca?q=dune")).toBe(false)
  })

  it("animates swaps between shell screens", () => {
    expect(isAppScreenTransition("/busca", "/")).toBe(true)
    expect(isAppScreenTransition("/", "/busca")).toBe(true)
    expect(isAppScreenTransition("/titulo/filme/1", "/titulo/filme/2")).toBe(true)
    expect(isAppScreenTransition("/watchlist", "/preferencias")).toBe(true)
  })

  it("does not animate navigation to auth or onboarding", () => {
    expect(isAppScreenTransition("/", "/login")).toBe(false)
    expect(isAppScreenTransition("/", "/login?intent=watchlist")).toBe(false)
    expect(isAppScreenTransition("/watchlist", "/cadastro")).toBe(false)
    expect(isAppScreenTransition("/", "/onboarding")).toBe(false)
    expect(isAppScreenTransition("/preferencias", "/recuperar-senha")).toBe(false)
  })
})

describe("titleHrefParts", () => {
  it("reads tipo and id from a title href", () => {
    expect(titleHrefParts("/titulo/filme/42?region=BR")).toEqual({
      tipo: "filme",
      id: "42",
    })
    expect(titleHrefParts("/busca")).toBeNull()
  })
})
