"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { ChevronDown } from "lucide-react"
import { Logo3DOverlay } from "@/components/r3f-blob"
import TrustMarquee from "@/components/trust-marquee"
import { useKmLocale, type LocaleCode } from "@/hooks/use-km-locale"
import {
  isSiteLoaderDone,
  SITE_LOADER_DONE_EVENT,
} from "@/lib/site-loader-done"

const HERO_IMAGE = "/images/background.webp"

const HERO_COPY: Record<
  LocaleCode,
  {
    titleWord1: string
    titleWord2: string
    titleAccent: string
    description: string
    scrollHint: string
  }
> = {
  en: {
    titleWord1: "Kinshasa",
    titleWord2: "Mall",
    titleAccent: "Where the city gathers",
    description:
      "Shopping, dining, and experiences — a destination at the heart of Kinshasa.",
    scrollHint: "Explore",
  },
  fr: {
    titleWord1: "Kinshasa",
    titleWord2: "Mall",
    titleAccent: "Là où la ville se retrouve",
    description:
      "Shopping, restauration et loisirs — une destination au cœur de Kinshasa.",
    scrollHint: "Découvrir",
  },
}

const EASE_HERO = [0.16, 1, 0.3, 1] as const

export default function PremiumHero() {
  const locale = useKmLocale()
  const t = HERO_COPY[locale]
  const reduceMotion = useReducedMotion()
  const [loaderDone, setLoaderDone] = useState(false)

  useEffect(() => {
    if (isSiteLoaderDone()) {
      setLoaderDone(true)
      return
    }
    const onDone = () => setLoaderDone(true)
    window.addEventListener(SITE_LOADER_DONE_EVENT, onDone)
    return () => window.removeEventListener(SITE_LOADER_DONE_EVENT, onDone)
  }, [])

  const heroTextContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.14,
        delayChildren: reduceMotion ? 0 : 0.06,
      },
    },
  }

  const heroTextItem = {
    hidden: {
      opacity: reduceMotion ? 1 : 0,
      y: reduceMotion ? 0 : 32,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.72,
        ease: EASE_HERO,
      },
    },
  }

  const scrollPastHero = () => {
    window.scrollTo({
      top: Math.min(
        window.innerHeight,
        document.documentElement.scrollHeight - window.innerHeight
      ),
      behavior: "smooth",
    })
  }

  return (
    <section
      id="home"
      className="relative flex min-h-[100lvh] w-full flex-col overflow-hidden bg-background lg:min-h-[100svh]"
    >
      <div className="absolute inset-0 z-0">
        <div className="hero-kenburns absolute inset-0 origin-center overflow-hidden">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-[1] hidden opacity-[0.045] mix-blend-overlay dark:opacity-[0.06] md:block"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-background/50 via-background/20 to-background" />
      </div>

      <div className="absolute inset-0 z-10">
        <Logo3DOverlay />
      </div>

      <div className="relative z-20 flex flex-1 flex-col items-center justify-center container mx-auto px-4 pt-20 pb-8 text-center sm:px-6 sm:pt-24 md:pt-28">
        <h1 className="sr-only">
          {t.titleWord1} {t.titleWord2}. {t.titleAccent}
        </h1>
        <motion.div
          variants={heroTextContainer}
          initial="hidden"
          animate={loaderDone ? "visible" : "hidden"}
          className="mb-3 flex w-full max-w-full flex-col items-center gap-1 sm:mb-4 sm:gap-1.5"
          aria-hidden
        >
          <motion.p
            variants={heroTextItem}
            className="font-hero-wordmark mx-auto w-full text-center text-[clamp(2.15rem,11vw,8.5rem)] uppercase leading-[0.88] tracking-[-0.04em] sm:text-[clamp(3.25rem,13vw,8.5rem)] md:text-[clamp(4rem,16vw,8.5rem)]"
          >
            <span className="hero-text-dominant [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
              {t.titleWord1}
            </span>{" "}
            <span className="hero-text-accent [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
              {t.titleWord2}
            </span>
          </motion.p>
          <motion.p
            variants={heroTextItem}
            className="font-heading hero-text-secondary max-w-5xl px-3 text-center text-[clamp(1.875rem,5.25vw,4rem)] font-semibold leading-tight tracking-[-0.03em] [text-shadow:0_2px_20px_rgba(0,0,0,0.4)] sm:text-[clamp(2rem,4.75vw,4.25rem)]"
          >
            {t.titleAccent}
          </motion.p>
          <motion.p
            variants={heroTextItem}
            className="hero-text-secondary mt-1 mx-auto max-w-2xl px-1 text-sm leading-snug font-light [text-shadow:0_1px_14px_rgba(0,0,0,0.35)] sm:mt-1.5 sm:px-0 sm:text-base md:mt-2 md:text-xl lg:text-2xl"
          >
            {t.description}
          </motion.p>
        </motion.div>
      </div>

      <div className="relative z-30 mt-auto flex w-full flex-col items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaderDone ? 1 : 0 }}
          transition={{
            delay: reduceMotion || !loaderDone ? 0 : 0.95,
            duration: reduceMotion ? 0 : 0.8,
          }}
          className="flex flex-col items-center gap-2 pb-4"
        >
          <button
            type="button"
            onClick={scrollPastHero}
            className="text-muted-foreground hover:text-foreground group flex flex-col items-center gap-1 transition-colors"
            aria-label={t.scrollHint}
          >
            <span className="text-[10px] font-medium tracking-[0.28em] uppercase">
              {t.scrollHint}
            </span>
            <ChevronDown
              className="h-5 w-5 opacity-70 motion-safe:animate-bounce group-hover:opacity-100"
              strokeWidth={1.25}
            />
          </button>
        </motion.div>
        <TrustMarquee embedded />
      </div>
    </section>
  )
}
