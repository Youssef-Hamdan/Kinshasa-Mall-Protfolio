"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

export type LocaleCode = "en" | "fr"

function subscribeKmLocale(onChange: () => void) {
  if (typeof window === "undefined") return () => {}
  const obs = new MutationObserver(onChange)
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  })
  window.addEventListener("storage", onChange)
  return () => {
    obs.disconnect()
    window.removeEventListener("storage", onChange)
  }
}

function getKmLocaleSnapshot(): LocaleCode {
  if (typeof document === "undefined") return "en"
  const lang = document.documentElement.lang || ""
  return lang.toLowerCase().startsWith("fr") ? "fr" : "en"
}

/**
 * After mount, reads `document.documentElement.lang` (synced with getServerSnapshot `"en"` for SSR).
 * Returns `"en"` until mounted so the first client paint always matches server HTML during hydration.
 */
export function useKmLocale(): LocaleCode {
  const fromStore = useSyncExternalStore(
    subscribeKmLocale,
    getKmLocaleSnapshot,
    (): LocaleCode => "en"
  )
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const fallback: LocaleCode = "en"
  return mounted ? fromStore : fallback
}
