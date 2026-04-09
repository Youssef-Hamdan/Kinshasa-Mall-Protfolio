"use client"

import { ReactLenis } from "lenis/react"

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
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
