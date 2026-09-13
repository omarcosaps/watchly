"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { MOTION_OUT, prefersReducedMotion } from "@/lib/motion"

export const useLeaveNavigate = () => {
  const exitingRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const [leaving, setLeaving] = useState(false)

  const clearLeave = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    exitingRef.current = false
    setLeaving(false)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const leaveThen = useCallback((navigate: () => void) => {
    if (exitingRef.current) return
    if (prefersReducedMotion()) {
      navigate()
      return
    }

    exitingRef.current = true
    setLeaving(true)
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      navigate()
    }, MOTION_OUT)
  }, [])

  return { leaving, leaveThen, clearLeave }
}
