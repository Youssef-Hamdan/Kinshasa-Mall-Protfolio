"use client"

import type { Variants } from "motion/react"
import MallInfoSection from "@/components/mall-info-section"
import PremiumHero from "@/components/premium-hero"
import { TimelineAnimation } from "@/components/uilayouts/timeline-animation"
import { cn } from "@/lib/utils"

const sectionRevealVariants: Variants = {
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.08,
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
  hidden: {
    filter: "blur(12px)",
    y: 28,
    opacity: 0,
  },
}

export function HomePage() {
  return (
    <main className={cn("min-h-screen bg-background")}>
      <TimelineAnimation
        as="div"
        trigger="self"
        animationNum={1}
        customVariants={sectionRevealVariants}
        className="relative w-full"
      >
        <PremiumHero />
      </TimelineAnimation>

      {/*
        Avoid wrapping sticky + scroll-heavy sections in motion opacity/blur/y — the
        animated ancestor composites the whole subtree and can jitter on iOS Safari.
        MallInfoSection already uses in-view text motion internally.
      */}
      <div className="relative w-full">
        <MallInfoSection />
      </div>
    </main>
  )
}
