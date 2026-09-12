"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

type ToastContextValue = {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null)
  const timerRef = useRef<number>(0)

  const showToast = useCallback((next: string) => {
    setMessage(next)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setMessage(null), 2400)
  }, [])

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message ? (
        <div
          role="status"
          className="toast-in fixed bottom-[26px] left-1/2 z-[80] -translate-x-1/2 rounded-full border border-white/14 bg-[rgba(28,30,38,0.92)] px-[22px] py-[11px] text-[13.5px] font-semibold shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-[14px]"
        >
          {message}
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast precisa do ToastProvider")
  }
  return context
}
