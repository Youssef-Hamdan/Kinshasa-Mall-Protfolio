"use client"

import type { JSX } from "react"
import { motion, type Variants } from "motion/react"
import { cn } from "@/lib/utils"

type Direction = "up" | "down" | "left" | "right"

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

function directionVariants(direction: Direction): Variants {
  const x =
    direction === "left" ? -48 : direction === "right" ? 48 : 0
  const y =
    direction === "up" ? -48 : direction === "down" ? 48 : 0

  return {
    hidden: {
      filter: "blur(10px)",
      opacity: 0,
      x,
      y,
    },
    visible: {
      filter: "blur(0px)",
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }
}

const defaultViewport = {
  amount: 0.35,
  margin: "0px 0px -12% 0px",
  once: true,
} as const

export type TextAnimationProps = {
  text: string
  /** @deprecated use `className` */
  classname?: string
  className?: string
  as?: keyof JSX.IntrinsicElements
  /**
   * When copy updates but motion children would stay stuck (e.g. language switch),
   * pass a value that changes with the copy (`locale`) so the animation tree remounts.
   */
  animationKey?: string
  viewport?: {
    amount?: number
    margin?: string
    once?: boolean
  }
  variants?: Variants
  direction?: Direction
  letterAnime?: boolean
  lineAnime?: boolean
}

/**
 * Scroll-triggered text: blur → sharp, with optional word / letter stagger.
 * Default export matches `@/components/ui/scroll-text` usage in demos.
 */
export default function TextAnimation({
  as = "h2",
  text,
  classname = "",
  className: classNameProp,
  animationKey,
  viewport = defaultViewport,
  variants,
  direction = "down",
  letterAnime = false,
  lineAnime = false,
}: TextAnimationProps) {
  const baseVariants = variants ?? directionVariants(direction)
  const wordVariants: Variants = {
    hidden: baseVariants.hidden ?? {},
    visible: {
      ...(typeof baseVariants.visible === "object" && baseVariants.visible !== null
        ? baseVariants.visible
        : {}),
    },
  }

  const MotionComponent = motion[
    as as keyof typeof motion
  ] as typeof motion.div

  const mergedClassName = cn(classNameProp, classname)

  /** Remount when `text` or `animationKey` changes so `whileInView` + stagger apply to new children */
  const motionTreeKey =
    animationKey !== undefined ? `${animationKey}::${text}` : text

  return (
    <MotionComponent
      key={motionTreeKey}
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}
      viewport={viewport}
      className={cn("inline-block", mergedClassName)}
    >
      {lineAnime ? (
        <motion.span className="inline-block" variants={wordVariants}>
          {text}
        </motion.span>
      ) : (
        <>
          {text.split(" ").map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
              className="inline-block"
              variants={letterAnime ? {} : wordVariants}
            >
              {letterAnime ? (
                <>
                  {word.split("").map((letter, letterIndex) => (
                    <motion.span
                      key={`${letter}-${letterIndex}`}
                      className="inline-block"
                      variants={wordVariants}
                    >
                      {letter}
                    </motion.span>
                  ))}
                  {"\u00A0"}
                </>
              ) : (
                <>
                  {word}
                  {"\u00A0"}
                </>
              )}
            </motion.span>
          ))}
        </>
      )}
    </MotionComponent>
  )
}
