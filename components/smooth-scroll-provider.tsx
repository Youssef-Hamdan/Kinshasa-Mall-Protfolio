"use client"

import { ReactLenis } from "lenis/react"
import { useEffect, useState } from "react"

/** Tailwind `lg` — Lenis is desktop-only; phones keep native momentum scrolling. */
const LG_MIN_WIDTH = "(min-width: 1024px)"

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [useLenis, setUseLenis] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(LG_MIN_WIDTH)
    const apply = () => setUseLenis(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  if (!useLenis) {
    return <>{children}</>
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        autoResize: true,
        /** Fixes end-of-page scroll height when layout is tall / sticky-heavy */
        naiveDimensions: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
