"use client"

import { useEffect, useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import { forceWindowScrollTop } from "@/lib/scroll-top"

/**
 * Keeps `/` at the hero on hard reload (no hash). Disables browser scroll restore
 * and re-applies top after layout / loader / heavy assets.
 */
export function ScrollRestoration() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    if (pathname !== "/") return
    if (window.location.hash.slice(1)) return
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }
    forceWindowScrollTop()
  }, [pathname])

  useEffect(() => {
    if (pathname !== "/") return
    if (window.location.hash.slice(1)) return
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }

    forceWindowScrollTop()
    const delays = [0, 32, 100, 250, 500, 1200].map((ms) =>
      window.setTimeout(() => forceWindowScrollTop(), ms)
    )
    const onLoad = () => forceWindowScrollTop()
    window.addEventListener("load", onLoad)
    return () => {
      delays.forEach(clearTimeout)
      window.removeEventListener("load", onLoad)
    }
  }, [pathname])

  return null
}
