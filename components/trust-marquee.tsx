"use client"

import { useKmLocale, type LocaleCode } from "@/hooks/use-km-locale"
import { cn } from "@/lib/utils"

const ITEMS: Record<LocaleCode, string[]> = {
  en: [
    "Retail",
    "Dining",
    "Cinema",
    "Events",
    "Family",
    "Wellness",
    "Nightlife",
    "Community",
  ],
  fr: [
    "Shopping",
    "Restauration",
    "Cinéma",
    "Événements",
    "Famille",
    "Bien-être",
    "Sorties",
    "Communauté",
  ],
}

type TrustMarqueeProps = {
  embedded?: boolean
}

export default function TrustMarquee({ embedded }: TrustMarqueeProps) {
  const locale = useKmLocale()
  const items = ITEMS[locale]
  const doubled = [...items, ...items]

  return (
    <div
      className={cn(
        "w-full overflow-hidden border-t border-border/30 bg-background/35 backdrop-blur-[2px]",
        embedded ? "pb-[max(0.75rem,env(safe-area-inset-bottom))]" : ""
      )}
      aria-hidden
    >
      <div className="trust-marquee-track flex w-max gap-x-10 gap-y-2 py-3 sm:gap-x-14">
        {doubled.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="shrink-0 text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground sm:text-xs"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
