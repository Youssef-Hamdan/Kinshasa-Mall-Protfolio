"use client"

import { useRef } from "react"
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
} from "motion/react"
import { wrap } from "motion-utils"
import { cn } from "@/lib/utils"

export type ScrollBaseAnimationProps = {
  children: React.ReactNode
  baseVelocity: number
  /** Applied to the moving text row (typography, weight, etc.). */
  className?: string
  /** Applied to the outer clip (`overflow-hidden`) — use this to set visible width, e.g. `max-w-2xl w-full mx-auto`. */
  wrapperClassName?: string
  /** @deprecated typo — use `className` */
  clasname?: string
  delay?: number
}

/**
 * Horizontal scroll-velocity marquee: base drift + scroll speed coupling (Framer-style).
 */
export default function ScrollBaseAnimation({
  children,
  baseVelocity,
  className,
  wrapperClassName,
  clasname,
  delay = 0,
}: ScrollBaseAnimationProps) {
  const reduceMotion = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  })
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  })

  const directionFactor = useRef(1)
  const delayStart = useRef<number | null>(null)

  useAnimationFrame((time, delta) => {
    if (reduceMotion) return
    if (delayStart.current === null) delayStart.current = time
    if (time - delayStart.current < delay) return

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000)

    const vf = velocityFactor.get()
    if (vf < 0) {
      directionFactor.current = -1
    } else if (vf > 0) {
      directionFactor.current = 1
    }

    moveBy += directionFactor.current * moveBy * vf

    baseX.set(baseX.get() + moveBy)
  })

  const x = useTransform(baseX, (v) => {
    if (baseVelocity >= 0) {
      return `${-wrap(0, 50, v)}%`
    }
    return `${wrap(-50, 0, v)}%`
  })

  const merged = className ?? clasname ?? ""

  if (reduceMotion) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden",
          wrapperClassName
        )}
      >
        <div className={`flex justify-center text-center ${merged}`}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn("relative w-full overflow-hidden", wrapperClassName)}
    >
      <motion.div
        className={`flex w-max max-w-none flex-nowrap whitespace-nowrap ${merged}`}
        style={{ x }}
      >
        <span className="inline-block shrink-0 px-[4vw]">{children}</span>
        <span className="inline-block shrink-0 px-[4vw]" aria-hidden>
          {children}
        </span>
      </motion.div>
    </div>
  )
}
