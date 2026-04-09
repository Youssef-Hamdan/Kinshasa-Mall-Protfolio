"use client"

import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "km-locale"

type Locale = "en" | "fr"

type LanguageToggleProps = {
  className?: string
  /** Slightly smaller for dense toolbars */
  compact?: boolean
}

export function LanguageToggle({ className, compact }: LanguageToggleProps) {
  const [locale, setLocaleState] = useState<Locale>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null
      if (stored === "en" || stored === "fr") {
        setLocaleState(stored)
        document.documentElement.lang = stored === "fr" ? "fr" : "en"
      }
    } catch {
      /* ignore */
    }
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = next === "fr" ? "fr" : "en"
  }, [])

  if (!mounted) {
    return (
      <span
        className={cn(
          "inline-flex h-9 w-[5.25rem] shrink-0 rounded-full",
          compact && "h-8 w-[4.75rem]",
          className
        )}
        aria-hidden
      />
    )
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "relative inline-flex h-9 min-w-[5.25rem] items-stretch rounded-full border border-zinc-300/90 bg-zinc-200/50 p-0.5 dark:border-zinc-500/45 dark:bg-zinc-800/85",
        compact && "h-8 min-w-[4.75rem]",
        className
      )}
    >
      {/* Flat light pill — no gradients or drop shadows (reference: minimal “stadium” control) */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-4px)] rounded-full bg-white transition-transform duration-200 ease-out dark:bg-zinc-50"
        style={{
          transform:
            locale === "en"
              ? "translateX(0)"
              : "translateX(calc(100% + 4px))",
        }}
      />
      {(["en", "fr"] as const).map((code) => {
        const selected = locale === code
        return (
          <button
            key={code}
            type="button"
            aria-pressed={selected}
            className={cn(
              "relative z-[1] min-w-[2.35rem] flex-1 rounded-full px-2.5 font-sans text-xs font-medium uppercase tracking-wide outline-none transition-colors duration-200",
              compact && "min-w-[2.1rem] px-2 text-[11px]",
              selected
                ? "text-zinc-900 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300",
              "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--km-teal)_50%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            )}
            onClick={() => setLocale(code)}
          >
            {code.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
