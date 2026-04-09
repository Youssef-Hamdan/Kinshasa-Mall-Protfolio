"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import { motion, type Variants } from "motion/react"
import { Car, Clock, Dumbbell, Store, UtensilsCrossed } from "lucide-react"
import { CountUpInteger } from "@/components/count-up"
import { useKmLocale } from "@/hooks/use-km-locale"
import {
  type HeroLinePart,
  joinHeroParts,
  MALL_GYM_COUNT,
  MALL_RESTAURANT_COUNT,
  MALL_SHOP_COUNT,
  mallInfoCopy,
  mallLayoutGallerySkew,
  mallLayoutGallerySticky,
} from "@/lib/mall-info-data"
import TextAnimation from "@/components/ui/scroll-text"
import { cn } from "@/lib/utils"

const blurReveal: Variants = {
  hidden: { filter: "blur(10px)", opacity: 0, y: 20 },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
    transition: { ease: "linear" },
  },
}

const blurRevealTight: Variants = {
  hidden: { filter: "blur(4px)", opacity: 0, y: 12 },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
}

/** Matches scroll-text `direction="right"` when using custom blur styling */
const blurRevealFromRight: Variants = {
  hidden: { filter: "blur(4px)", opacity: 0, x: 28, y: 0 },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
}

const heroContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const heroViewport = {
  amount: 0.35,
  margin: "0px 0px -12% 0px",
  once: true,
} as const

function heroWordsFromParts(parts: readonly HeroLinePart[]) {
  const out: { word: string; accent: boolean }[] = []
  for (const p of parts) {
    const tokens = p.text.trim().length > 0 ? p.text.split(/\s+/).filter(Boolean) : []
    for (const word of tokens) {
      out.push({ word, accent: !!p.accent })
    }
  }
  return out
}

function wordVariantsFrom(base: Variants): Variants {
  return {
    hidden: base.hidden ?? {},
    visible: {
      ...(typeof base.visible === "object" && base.visible !== null ? base.visible : {}),
    },
  }
}

/** Hero lines with optional brand-teal (`--km-teal`) accent words; matches `TextAnimation` stagger */
function HeroAnimatedPhrase({
  parts,
  variants: baseVariants,
  className,
  animationKey,
}: {
  parts: readonly HeroLinePart[]
  variants: Variants
  className?: string
  animationKey: string
}) {
  const words = useMemo(() => heroWordsFromParts(parts), [parts])
  const wordVariants = wordVariantsFrom(baseVariants)
  const motionTreeKey = `${animationKey}::${joinHeroParts(parts)}`

  return (
    <motion.p
      key={motionTreeKey}
      initial="hidden"
      whileInView="visible"
      variants={heroContainerVariants}
      viewport={heroViewport}
      className={cn("inline-block", className)}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${i}-${w.word}`}
          variants={wordVariants}
          className={cn(
            "inline-block",
            w.accent &&
              "text-[var(--km-teal)] [text-shadow:0_2px_36px_rgba(54,131,147,0.5)]"
          )}
        >
          {w.word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.p>
  )
}

const HexagonalBackground = dynamic(
  () =>
    import("@/components/hexagonal-background").then((m) => m.HexagonalBackground),
  { ssr: false }
)

export default function MallInfoSection() {
  const locale = useKmLocale()
  const t = mallInfoCopy[locale]

  return (
    <div
      id="mall-info"
      className="w-full min-w-0 bg-black text-white"
      aria-label={joinHeroParts(t.heroQuoteLine1Parts)}
    >
      {/* Section 1 — hero quote + hex façade */}
      <div className="wrapper relative w-full">
        <section className="sticky top-0 grid h-[100svh] w-full place-content-center overflow-hidden bg-slate-950 text-white">
          <HexagonalBackground />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/20 via-transparent to-black/35"
            aria-hidden
          />
          <blockquote className="relative z-10 mx-auto w-full max-w-[min(100%,92rem)] px-4 text-center sm:px-8 lg:px-12">
            <HeroAnimatedPhrase
              animationKey={locale}
              parts={t.heroQuoteLine1Parts}
              variants={blurReveal}
              className="block w-full text-balance font-heading text-[clamp(3.25rem,12vw,9.5rem)] font-bold leading-[0.88] tracking-[-0.07em] text-white [text-shadow:0_4px_48px_rgba(0,0,0,0.45)]"
            />
            <HeroAnimatedPhrase
              animationKey={locale}
              parts={t.heroQuoteLine2Parts}
              variants={blurReveal}
              className="mt-4 block w-full text-balance font-heading text-[clamp(2.875rem,10.5vw,8rem)] font-bold leading-[0.88] tracking-[-0.07em] text-white/90 [text-shadow:0_4px_48px_rgba(0,0,0,0.45)] sm:mt-5 md:mt-6"
            />
          </blockquote>
        </section>
      </div>

      {/* Section 2 — hex background + opening hours / stats (hex stays z-0; content above) */}
      <div className="relative w-full bg-[#070708]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <HexagonalBackground />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/18 via-transparent to-black/30"
          aria-hidden
        />
        <div className="relative z-10 isolate text-white">
        {/* Opening hours — reference layout: sticky left column, plain grid of skew images on the right (scrolls past) */}
        <section className="w-full">
          <div className="grid grid-cols-[1fr_1fr] md:grid-cols-[minmax(17rem,1fr)_minmax(17rem,1fr)]">
            <div className="sticky top-0 self-start flex h-[100svh] items-center justify-center px-2 py-8 sm:px-4 md:px-8 md:py-0">
              <div className="w-full max-w-[12rem] sm:max-w-md md:max-w-lg">
                {/* Kicker + icon — matches hero quote label; brand accent on icon */}
                <div className="mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3">
                  <Clock
                    className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-[var(--km-teal)]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <TextAnimation animationKey={locale}
                    as="h2"
                    text={t.hoursTitle}
                    variants={blurRevealTight}
                    className="text-left text-[10px] sm:text-sm font-medium uppercase tracking-[0.22em] text-white/55 sm:text-base"
                  />
                </div>
                <dl className="space-y-0 text-left">
                  {t.rows.map((row) => (
                    <div
                      key={row.days}
                      className="flex flex-col gap-1.5 border-b border-[color-mix(in_srgb,var(--km-teal)_14%,transparent)] py-5 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                    >
                      <dt className="font-heading text-sm font-medium leading-snug tracking-tight text-white/92 [text-shadow:0_1px_18px_rgba(0,0,0,0.35)] sm:text-xl">
                        <TextAnimation animationKey={locale}
                          as="span"
                          text={row.days}
                          variants={blurRevealTight}
                          className="inline-block text-left"
                        />
                      </dt>
                      <dd className="font-mono text-xs font-semibold tabular-nums tracking-tight text-[var(--km-soft)] sm:text-2xl">
                        <TextAnimation animationKey={locale}
                          as="span"
                          text={row.hours}
                          variants={blurRevealTight}
                          className="inline-block text-left"
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
                <TextAnimation animationKey={locale}
                  as="p"
                  text={t.hoursNote}
                  variants={blurRevealTight}
                  lineAnime
                  className="mt-4 sm:mt-8 block w-full max-w-prose text-left font-sans text-[10px] sm:text-base font-light leading-relaxed tracking-wide text-white/55 [text-shadow:0_1px_12px_rgba(0,0,0,0.25)] sm:text-lg"
                />
              </div>
            </div>
            <div className="overflow-x-clip p-2 sm:p-4">
              <div className="grid gap-2">
              {mallLayoutGallerySkew.map((img, i) => (
                <figure
                  key={`hours-img-${i}-${img.src}`}
                  className={cn(
                    "grid place-content-center",
                    i % 2 === 0 ? "-skew-x-6 sm:-skew-x-12" : "skew-x-6 sm:skew-x-12"
                  )}
                >
                  <div className="relative mx-auto h-[40svh] w-full max-w-[28rem] overflow-hidden bg-[#0a0a0a] sm:h-[28rem] sm:w-[26rem]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- avoids next/image optimizer issues with gallery tiles */}
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="h-full w-full object-cover object-center transition-all duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </figure>
              ))}
              </div>
            </div>
          </div>
        </section>

        {/* Shops & restaurants — sticky images left, animated stats right */}
        <section className="w-full pb-12 pt-6 md:pb-16 md:pt-0">
          {/*
            Important: do not use min-w-0 on the gallery column — with md:grid-cols-2 (minmax(0,1fr))
            the track can collapse to 0px and only the hex + stats stay visible.
            minmax(…px, 1fr) keeps both columns visible.
          */}
          <div className="grid grid-cols-[1fr_1fr] gap-4 px-2 sm:gap-10 sm:px-4 md:grid-cols-[minmax(17rem,1fr)_minmax(17rem,1fr)] md:gap-8 md:px-8">
            <div className="relative z-20 grid w-full gap-2">
              {mallLayoutGallerySticky.map((img, i) => (
                <figure
                  key={`sticky-${i}-${img.src}`}
                  className="sticky top-0 grid h-[100svh] w-full place-content-center md:h-screen"
                >
                  <div className="relative mx-auto h-[min(16rem,40svh)] w-full max-w-xl overflow-hidden rounded-md bg-[#0a0a0a] shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:h-[28rem] md:h-[min(32rem,72vh)] md:max-w-[32rem]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- avoids next/image optimizer issues with gallery tiles */}
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="h-full w-full object-cover object-center"
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={i === 0 ? "high" : "auto"}
                    />
                  </div>
                </figure>
              ))}
            </div>
            <div className="sticky top-0 self-start z-10 flex h-[100svh] min-w-0 flex-col justify-center py-8 md:h-screen md:py-12">
              <TextAnimation animationKey={locale}
                as="p"
                text={t.statsLead}
                variants={blurRevealFromRight}
                className="mb-4 sm:mb-6 block w-full text-right text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-white/45"
              />
              <div className="ml-auto w-full max-w-md space-y-6 text-right sm:space-y-10">
                <div>
                  <div className="mb-1 sm:mb-2 flex items-center justify-end gap-1 sm:gap-2 text-white/55">
                    <TextAnimation animationKey={locale}
                      as="span"
                      text={t.statShops}
                      variants={blurRevealTight}
                      className="inline-block text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.2em]"
                    />
                    <Store
                      className="h-3 w-3 sm:h-4 sm:w-4 text-[var(--km-warm)]"
                      strokeWidth={1.25}
                    />
                  </div>
                  <p className="font-hero-wordmark text-3xl font-bold tabular-nums tracking-tight text-white sm:text-6xl md:text-7xl">
                    <CountUpInteger
                      to={MALL_SHOP_COUNT}
                      suffix={t.shopsSuffix}
                    />
                  </p>
                </div>
                <div>
                  <div className="mb-1 sm:mb-2 flex items-center justify-end gap-1 sm:gap-2 text-white/55">
                    <TextAnimation animationKey={locale}
                      as="span"
                      text={t.statRestaurants}
                      variants={blurRevealTight}
                      className="inline-block text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.2em]"
                    />
                    <UtensilsCrossed
                      className="h-3 w-3 sm:h-4 sm:w-4 text-[var(--km-teal)]"
                      strokeWidth={1.25}
                    />
                  </div>
                  <p className="font-hero-wordmark text-3xl font-bold tabular-nums tracking-tight text-white sm:text-6xl md:text-7xl">
                    <CountUpInteger
                      to={MALL_RESTAURANT_COUNT}
                      suffix={t.shopsSuffix}
                    />
                  </p>
                </div>
                <div>
                  <div className="mb-1 sm:mb-2 flex items-center justify-end gap-1 sm:gap-2 text-white/55">
                    <TextAnimation animationKey={locale}
                      as="span"
                      text={t.statGym}
                      variants={blurRevealTight}
                      className="inline-block text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.2em]"
                    />
                    <Dumbbell
                      className="h-3 w-3 sm:h-4 sm:w-4 text-[var(--km-warm)]"
                      strokeWidth={1.25}
                    />
                  </div>
                  <p className="font-hero-wordmark text-3xl font-bold tabular-nums tracking-tight text-white sm:text-6xl md:text-7xl">
                    <CountUpInteger to={MALL_GYM_COUNT} suffix="" />
                  </p>
                </div>
                <div>
                  <div className="mb-1 sm:mb-2 flex items-center justify-end gap-1 sm:gap-2 text-white/55">
                    <TextAnimation animationKey={locale}
                      as="span"
                      text={t.statParking}
                      variants={blurRevealTight}
                      className="inline-block max-w-[min(100%,14rem)] text-[8px] sm:text-[10px] font-medium uppercase leading-snug tracking-[0.2em]"
                    />
                    <Car
                      className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-[var(--km-teal)]"
                      strokeWidth={1.25}
                    />
                  </div>
                  <TextAnimation animationKey={locale}
                    as="p"
                    text={t.parkingValue}
                    variants={blurRevealTight}
                    className="block w-full text-right font-hero-wordmark text-2xl sm:text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>
  )
}
