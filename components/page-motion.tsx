"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { useLeaveNavigate } from "@/hooks/use-leave-navigate"
import { currentLocationHref, screenIdentity } from "@/lib/motion"

type PageMotionNavValue = {
  currentHref: string
  leaveThen: (navigate: () => void) => void
}

type PageMotionLeaveValue = {
  leaveFrom: string | null
  leaving: boolean
}

const PageMotionNavContext = createContext<PageMotionNavValue | null>(null)
const PageMotionLeaveContext = createContext<PageMotionLeaveValue | null>(null)

export const PageMotionProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentHref = currentLocationHref(pathname, searchParams.toString())
  const currentId = screenIdentity(currentHref)
  const motion = useLeaveNavigate()
  const [leaveFrom, setLeaveFrom] = useState<string | null>(null)

  const leaveThen = useCallback(
    (navigate: () => void) => {
      setLeaveFrom(currentId)
      motion.leaveThen(navigate)
    },
    [currentId, motion.leaveThen],
  )

  useEffect(() => {
    motion.clearLeave()
    setLeaveFrom(null)
  }, [currentId, motion.clearLeave])

  const nav = useMemo(
    () => ({
      currentHref,
      leaveThen,
    }),
    [currentHref, leaveThen],
  )

  const leave = useMemo(
    () => ({
      leaveFrom,
      leaving: motion.leaving,
    }),
    [leaveFrom, motion.leaving],
  )

  return (
    <PageMotionNavContext value={nav}>
      <PageMotionLeaveContext value={leave}>{children}</PageMotionLeaveContext>
    </PageMotionNavContext>
  )
}

export const PageMotionFrame = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentHref = currentLocationHref(pathname, searchParams.toString())
  const { leaveFrom, leaving } = usePageMotionLeave()
  const currentId = screenIdentity(currentHref)
  const isLeaving = leaving && currentId !== null && currentId === leaveFrom

  return (
    <div key={currentId ?? currentHref} className={isLeaving ? "d-leaving" : undefined}>
      {children}
    </div>
  )
}

export const usePageMotion = () => {
  const value = useContext(PageMotionNavContext)
  if (!value) {
    throw new Error("usePageMotion precisa do AppShell")
  }
  return value
}

export const usePageMotionOptional = () => {
  return useContext(PageMotionNavContext)
}

const usePageMotionLeave = () => {
  const value = useContext(PageMotionLeaveContext)
  if (!value) {
    throw new Error("usePageMotion precisa do AppShell")
  }
  return value
}
