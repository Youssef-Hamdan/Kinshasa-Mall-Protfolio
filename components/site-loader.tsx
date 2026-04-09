"use client"

import { useEffect, useState } from "react"
import { LiquidGlassSurface } from "@/components/ui/liquid-glass-surface"
import {
  HERO_3D_READY_EVENT,
  notifySiteLoaderDone,
} from "@/lib/site-loader-done"
import { forceWindowScrollTop } from "@/lib/scroll-top"

/** Avoid sub-ms flash; still short so fast devices feel snappy. */
const MIN_VISIBLE_MS = 450
/** Never trap the user if an asset hangs. */
const MAX_WAIT_MS = 14000

export function SiteLoader() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show")

  useEffect(() => {
    const start = performance.now()
    let cancelled = false
    let finished = false
    let threeReady = false

    const unlockScroll = () => {
      document.documentElement.style.overflow = ""
      if (!window.location.hash.slice(1)) {
        forceWindowScrollTop()
        window.setTimeout(() => forceWindowScrollTop(), 50)
      }
    }

    /** Dismiss loader only after the hero WebGL scene is ready (or safety timeout). */
    const goFade = () => {
      if (cancelled || finished) return
      if (!threeReady) return
      finished = true
      const elapsed = performance.now() - start
      const extra = Math.max(0, MIN_VISIBLE_MS - elapsed)
      window.setTimeout(() => {
        if (cancelled) return
        unlockScroll()
        setPhase("fade")
        window.setTimeout(() => {
          if (!cancelled) setPhase("gone")
        }, 320)
      }, extra)
    }

    const onHeroThreeReady = () => {
      threeReady = true
      goFade()
    }

    document.documentElement.style.overflow = "hidden"

    window.addEventListener(HERO_3D_READY_EVENT, onHeroThreeReady)

    const safety = window.setTimeout(() => {
      threeReady = true
      goFade()
    }, MAX_WAIT_MS)

    return () => {
      cancelled = true
      window.clearTimeout(safety)
      window.removeEventListener(HERO_3D_READY_EVENT, onHeroThreeReady)
      unlockScroll()
    }
  }, [])

  useEffect(() => {
    if (phase !== "gone") return
    notifySiteLoaderDone()
    if (window.location.hash.slice(1)) return
    forceWindowScrollTop()
    const t = window.setTimeout(() => forceWindowScrollTop(), 100)
    return () => window.clearTimeout(t)
  }, [phase])

  if (phase === "gone") return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={phase === "show"}
      className={`fixed inset-0 z-[9999] bg-white/82 transition-opacity duration-300 ease-out dark:bg-background/75 ${
        phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <LiquidGlassSurface
        borderRadius="0"
        className="min-h-[100svh] w-full"
        blurIntensity="xl"
        glowIntensity="sm"
        shadowIntensity="sm"
        contentClassName="flex min-h-[100svh] flex-col items-center justify-center gap-6 px-6"
      >
        <div className="text-center">
          <p className="font-heading text-foreground text-3xl font-bold uppercase tracking-[0.04em] md:text-4xl">
            Kinshasa Mall
          </p>
          <p className="text-muted-foreground mt-2 text-sm font-sans md:text-base">
            Loading your experience…
          </p>
        </div>
        <div
          className="border-muted border-t-primary size-11 rounded-full border-2 animate-spin"
          aria-hidden
        />
      </LiquidGlassSurface>
    </div>
  )
}
