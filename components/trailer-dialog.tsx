"use client"

import { useEffect, useId, useRef } from "react"

import { CloseIcon } from "@/components/icons"
import { youtubeEmbedUrl, youtubeTrailerUrl } from "@/lib/catalog/trailer"

type TrailerDialogProps = {
  title: string
  youtubeKey: string
  open: boolean
  onClose: () => void
}

export const TrailerDialog = ({ title, youtubeKey, open, onClose }: TrailerDialogProps) => {
  const labelId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-md md:p-8"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className="relative w-full max-w-4xl overflow-hidden rounded-[28px] bg-void ring-1 ring-white/10 shadow-[0_24px_80px_rgb(0_0_0/0.65)]"
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-mist">Trailer</p>
            <h2 id={labelId} className="font-display truncate text-2xl italic tracking-tight text-paper">
              {title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar trailer"
            className="press-pill glass inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-paper"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="relative aspect-video bg-panel">
          <iframe
            src={`${youtubeEmbedUrl(youtubeKey)}?rel=0`}
            title={`Trailer de ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
        <p className="px-5 py-3">
          <a
            href={youtubeTrailerUrl(youtubeKey)}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-mist underline-offset-4 hover:text-paper hover:underline"
          >
            Abrir no YouTube
          </a>
        </p>
      </div>
    </div>
  )
}
