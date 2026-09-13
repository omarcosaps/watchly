"use client"

import { useEffect, useState } from "react"

import { HOME_STAGGER_MS, prefersReducedMotion } from "@/lib/motion"

export const useEnterCascade = (durationMs = HOME_STAGGER_MS) => {
  const [enter, setEnter] = useState(true)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setEnter(false)
      return
    }

    const timer = window.setTimeout(() => {
      setEnter(false)
    }, durationMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [durationMs])

  return enter
}
